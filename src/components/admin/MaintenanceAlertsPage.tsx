import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AlertTriangle, Bell, CheckCircle, Clock, Wrench, Car, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { getDocuments, updateDocument } from '../../firebase';

interface MaintenanceAlert {
  id: string;
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  alertType: 'service' | 'tire' | 'battery' | 'brakes' | 'oil' | 'inspection' | 'Repair' | 'Full Service' | 'Oil Change' | 'Tire Replacement';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  dueDate: string;
  mileage: number;
  status: 'pending' | 'scheduled' | 'completed' | 'In Progress' | 'Completed';
  createdAt: string;
}

interface MaintenanceAlertsPageProps {
  gpsVehicleId?: string;
  gpsVehicleName?: string;
}

export function MaintenanceAlertsPage({ gpsVehicleId, gpsVehicleName }: MaintenanceAlertsPageProps) {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      // Fetch both maintenance records and vehicles in parallel
      const [maintenanceRecords, vehicles] = await Promise.all([
        getDocuments('maintenance'),
        getDocuments('vehicles')
      ]);

      console.log('Maintenance records fetched:', maintenanceRecords.length);
      console.log('Vehicles fetched:', vehicles.length);

      const mappedAlerts: MaintenanceAlert[] = maintenanceRecords
        // Filter for records that need alerts (not completed, or specifically marked as alert)
        // OR simply show all that are not "Completed"
        .filter(record => record.status !== 'Completed')
        .map(record => {
          const vehicle = vehicles.find(v => v.id === record.vehicleId || v.id === record.vehicleName || v.name === record.vehicleName);

          // Determine severity based on type, priority, or status
          let severity: any = record.priority || record.severity || 'medium';
          const type = (record.type || '').toLowerCase();

          if (record.status === 'In Progress') severity = 'high';
          if (type.includes('repair') || type.includes('brake') || type.includes('battery')) {
            if (severity !== 'critical') severity = 'high';
          }
          if (record.priority === 'urgent') severity = 'critical';

          const formatTimestamp = (val: any) => {
            if (!val) return 'Not set';
            if (typeof val === 'string') return val;
            if (val.toDate && typeof val.toDate === 'function') return val.toDate().toLocaleDateString();
            if (val.seconds) return new Date(val.seconds * 1000).toLocaleDateString();
            return String(val);
          };

          return {
            id: record.id,
            vehicleId: String(record.vehicleId || vehicle?.id || 'Unknown'),
            vehicleName: record.vehicleName || vehicle?.name || 'Unknown Vehicle',
            licensePlate: record.licensePlate || vehicle?.licensePlate || 'N/A',
            alertType: record.type as any,
            severity: severity,
            description: record.description || `Required ${record.type} for ${record.vehicleName}`,
            dueDate: formatTimestamp(record.date || record.nextServiceDate),
            mileage: Number(record.mileage || vehicle?.mileage || 0),
            status: record.status as any,
            createdAt: formatTimestamp(record.createdAt || record.date)
          };
        });

      setAlerts(mappedAlerts);
    } catch (error) {
      console.error('Error fetching maintenance alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAlerts = alerts
    .filter(alert => {
      const status = (alert.status || '').toLowerCase();
      const filterS = filterStatus.toLowerCase();
      const matchesStatus = filterStatus === 'all' ||
        (filterS === 'pending' && (status === 'pending' || status === 'scheduled' || status === '' || status === 'scheduled')) ||
        (filterS === 'in-progress' && (status === 'in progress' || status === 'in-progress' || status === 'ongoing')) ||
        (filterS === 'completed' && status === 'completed');
      const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
      return matchesStatus && matchesSeverity;
    })
    // Put GPS vehicle alerts first
    .sort((a, b) => {
      const aIsGps = a.vehicleId === gpsVehicleId || a.vehicleName === gpsVehicleName;
      const bIsGps = b.vehicleId === gpsVehicleId || b.vehicleName === gpsVehicleName;
      if (aIsGps && !bIsGps) return -1;
      if (!aIsGps && bIsGps) return 1;
      return 0;
    });

  const handleUpdateStatus = async (alertId: string, newStatus: string) => {
    try {
      await updateDocument('maintenance', alertId, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      setAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, status: newStatus as any } : alert
      ));

      alert(`Alert marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating alert status:', error);
      alert('Failed to update status');
    }
  };

  const handleSendNotification = (alertItem: MaintenanceAlert) => {
    alert(`Notification sent: ${alertItem.vehicleName} (${alertItem.licensePlate}) requires ${alertItem.alertType} maintenance`);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed') return 'bg-green-500';
    if (s === 'scheduled' || s === 'in progress') return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  const getAlertIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('service')) return <Wrench className="h-5 w-5" />;
    if (t.includes('tire')) return <Car className="h-5 w-5" />;
    if (t.includes('battery')) return <AlertTriangle className="h-5 w-5" />;
    if (t.includes('brake')) return <AlertCircle className="h-5 w-5" />;
    if (t.includes('oil')) return <Wrench className="h-5 w-5" />;
    if (t.includes('inspection')) return <CheckCircle className="h-5 w-5" />;
    return <Bell className="h-5 w-5" />;
  };

  const getCriticalCount = () => alerts.filter(a => a.severity === 'critical' && a.status.toLowerCase() !== 'completed').length;
  const getHighCount = () => alerts.filter(a => a.severity === 'high' && a.status.toLowerCase() !== 'completed').length;
  const getPendingCount = () => alerts.filter(a => a.status.toLowerCase() === 'pending' || a.status.toLowerCase() === 'in progress').length;
  const getScheduledCount = () => alerts.filter(a => a.status.toLowerCase() === 'scheduled').length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-red-600 animate-spin mb-4" />
        <p className="text-muted-foreground">Fetching maintenance alerts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-red-600">Maintenance Alerts</h2>
          {gpsVehicleName && (
            <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block"></span>
              GPS alerts for <strong>{gpsVehicleName}</strong> shown first
            </p>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-500 border-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">{getCriticalCount()}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500 border-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{getHighCount()}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Active Issues</p>
                <p className="text-2xl font-bold text-yellow-600">{getPendingCount()}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{getScheduledCount()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">Status:</span>
              <div className="flex gap-2">
                {['all', 'pending', 'in-progress', 'completed'].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className={filterStatus === status ? 'bg-red-600 hover:bg-red-700' : ''}
                  >
                    {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">Severity:</span>
              <div className="flex gap-2">
                {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
                  <Button
                    key={sev}
                    variant={filterSeverity === sev ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterSeverity(sev)}
                    className={filterSeverity === sev ? 'bg-red-600 hover:bg-red-700' : ''}
                  >
                    {sev.charAt(0).toUpperCase() + sev.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-green-600">
              <CheckCircle className="h-16 w-16 mx-auto mb-4" />
              <p className="text-xl font-bold mb-2">No Alerts Found</p>
              <p className="text-muted-foreground">All vehicles are in good condition!</p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 overflow-hidden ${getSeverityColor(alert.severity).replace('bg-', 'border-')}`}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Alert Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-xl ${getSeverityColor(alert.severity)} text-white shadow-lg`}>
                          {getAlertIcon(alert.alertType)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-lg">{alert.vehicleName}</h3>
                            {(alert.vehicleId === gpsVehicleId || alert.vehicleName === gpsVehicleName) && (
                              <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span>
                                GPS VEHICLE
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="font-mono">{alert.licensePlate}</Badge>
                            <span>•</span>
                            <span>{alert.id}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge className={`${getSeverityColor(alert.severity)} text-white font-bold`}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge className={`${getStatusColor(alert.status)} text-white font-bold`}>
                          {alert.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="bg-secondary/50 p-4 rounded-xl border border-secondary">
                      <p className="font-bold text-red-600 mb-1 flex items-center gap-1">
                        <Wrench className="h-4 w-4" />
                        {alert.alertType.toUpperCase()}
                      </p>
                      <p className="text-sm font-medium leading-relaxed">{alert.description}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                      <div className="bg-white p-2 rounded-lg border">
                        <span className="text-muted-foreground block text-xs">Target Date</span>
                        <p className="font-bold flex items-center gap-1 text-red-600">
                          <Calendar className="h-3 w-3" />
                          {alert.dueDate}
                        </p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border">
                        <span className="text-muted-foreground block text-xs">Current Mileage</span>
                        <p className="font-bold text-blue-600">{(alert.mileage || 0).toLocaleString()} km</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border">
                        <span className="text-muted-foreground block text-xs">Created On</span>
                        <p className="font-bold">{alert.createdAt}</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border">
                        <span className="text-muted-foreground block text-xs">Vehicle ID</span>
                        <p className="font-bold font-mono text-xs">{alert.vehicleId}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:w-48 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendNotification(alert)}
                      className="w-full font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Notify Staff
                    </Button>

                    {alert.status.toLowerCase() !== 'scheduled' && alert.status.toLowerCase() !== 'completed' && (
                      <Button
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
                        onClick={() => handleUpdateStatus(alert.id, 'Scheduled')}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                    )}

                    {alert.status.toLowerCase() !== 'completed' && (
                      <Button
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold shadow-md"
                        onClick={() => handleUpdateStatus(alert.id, 'Completed')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Done
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
