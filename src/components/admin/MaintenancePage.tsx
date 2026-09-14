import { useState, useEffect } from 'react';
import { Wrench, AlertTriangle, CheckCircle, Clock, Plus, X, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { formatCurrency } from '../ui/utils';
import { getDocuments, addDocument, updateDocument } from '../../firebase';

interface MaintenancePageProps {
  gpsVehicleId?: string;
  gpsVehicleName?: string;
}

export function MaintenancePage({ gpsVehicleId, gpsVehicleName }: MaintenancePageProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);

  const [newMaintenance, setNewMaintenance] = useState({
    vehicleName: gpsVehicleName || '',
    vehicleId: gpsVehicleId || '',
    type: '',
    date: '',
    mileage: '',
    cost: '',
    priority: 'medium',
    status: 'Scheduled',
    description: ''
  });

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const fetchMaintenance = async () => {
    try {
      setIsLoading(true);
      const data = await getDocuments('maintenance');
      // Sort by date descending
      const sortedData = data.sort((a: any, b: any) =>
        new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
      );
      setMaintenanceRecords(sortedData);
    } catch (error) {
      console.error('Error fetching maintenance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDocument('maintenance', id, { status: newStatus });
      setMaintenanceRecords(prev => prev.map(rec =>
        rec.id === id ? { ...rec, status: newStatus } : rec
      ));
      alert(`Maintenance status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating maintenance status:', error);
      alert('Failed to update status');
    }
  };

  const handleAddMaintenance = async () => {
    try {
      const record = {
        ...newMaintenance,
        cost: parseFloat(newMaintenance.cost) || 0,
        mileage: parseInt(newMaintenance.mileage) || 0,
        createdAt: new Date().toISOString()
      };

      const created = await addDocument('maintenance', record);
      setMaintenanceRecords([{ id: created.id, ...record }, ...maintenanceRecords]);

      setShowAddModal(false);
      setNewMaintenance({
        vehicleName: '',
        vehicleId: '',
        type: '',
        date: '',
        mileage: '',
        cost: '',
        priority: 'medium',
        status: 'Scheduled',
        description: ''
      });
      alert('Maintenance scheduled successfully!');
    } catch (error) {
      console.error('Error adding maintenance:', error);
      alert('Failed to schedule maintenance');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-red-600 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading maintenance logs...</p>
      </div>
    );
  }

  const formatTimestamp = (val: any) => {
    if (!val) return 'Not set';
    if (typeof val === 'string') return val;
    if (val.toDate && typeof val.toDate === 'function') return val.toDate().toLocaleDateString();
    if (val.seconds) return new Date(val.seconds * 1000).toLocaleDateString();
    return String(val);
  };

  const upcomingRecords = maintenanceRecords.filter(r => r.status !== 'Completed');
  const pastRecords = maintenanceRecords.filter(r => r.status === 'Completed');
  const urgentCount = upcomingRecords.filter(a =>
    a.priority === 'high' || a.priority === 'urgent' || a.severity === 'high' || a.severity === 'critical'
  ).length;

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-red-600">Maintenance Management</h2>
          {gpsVehicleName && (
            <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block"></span>
              GPS Vehicle: <strong>{gpsVehicleName}</strong> (WP-LUX-5678)
            </p>
          )}
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Maintenance
        </Button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Schedule Maintenance</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle Name</label>
                  <Input
                    placeholder="e.g. Toyota Camry"
                    value={newMaintenance.vehicleName}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, vehicleName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Maintenance Type</label>
                  <Select
                    value={newMaintenance.type}
                    onValueChange={(val: string) => setNewMaintenance({ ...newMaintenance, type: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Service Due">Service Due</SelectItem>
                      <SelectItem value="Oil Change">Oil Change</SelectItem>
                      <SelectItem value="Tire Rotation">Tire Rotation</SelectItem>
                      <SelectItem value="Brake Inspection">Brake Inspection</SelectItem>
                      <SelectItem value="Battery Check">Battery Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Due Date</label>
                    <Input
                      type="date"
                      value={newMaintenance.date}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Mileage</label>
                    <Input
                      type="number"
                      placeholder="km"
                      value={newMaintenance.mileage}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, mileage: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={newMaintenance.priority}
                    onValueChange={(val: string) => setNewMaintenance({ ...newMaintenance, priority: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full bg-red-600 hover:bg-red-700 text-white mt-4"
                  onClick={handleAddMaintenance}
                >
                  Schedule Maintenance
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Urgent Alerts</div>
                <div className="text-2xl">
                  {urgentCount}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Upcoming</div>
                <div className="text-2xl">{upcomingRecords.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-2xl">{pastRecords.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Alerts */}
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4">Upcoming Maintenance</h3>
          <div className="space-y-4">
            {upcomingRecords.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No upcoming maintenance</p>
            ) : (
              upcomingRecords.map((alert) => (
                <div key={alert.id} className={`flex items-center justify-between p-4 rounded-lg ${
                  (alert.vehicleId === gpsVehicleId || alert.vehicleName === gpsVehicleName)
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-secondary'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4>{alert.vehicleName}</h4>
                        {(alert.vehicleId === gpsVehicleId || alert.vehicleName === gpsVehicleName) && (
                          <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1 h-1 bg-green-300 rounded-full animate-pulse"></span>GPS
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.type} • {(alert.mileage || 0).toLocaleString()} km</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm">Due: {formatTimestamp(alert.date)}</div>
                    </div>
                    <Badge className={getPriorityColor(alert.priority || alert.severity || 'medium')}>
                      {(alert.priority || alert.severity || 'medium').toUpperCase()}
                    </Badge>
                    <div className="flex gap-1">
                      {alert.status === 'Scheduled' && (
                        <Button size="sm" onClick={() => handleUpdateStatus(alert.id, 'In Progress')} className="bg-blue-600 hover:bg-blue-700">
                          Start
                        </Button>
                      )}
                      {alert.status === 'In Progress' && (
                        <Button size="sm" onClick={() => handleUpdateStatus(alert.id, 'Completed')} className="bg-green-600 hover:bg-green-700">
                          Finish
                        </Button>
                      )}
                      {alert.status === 'Scheduled' || alert.status === 'In Progress' || !alert.status ? (
                        <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(alert.id, 'Completed')}>
                          Mark Done
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Maintenance */}
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4">Recent Maintenance</h3>
          <div className="space-y-4">
            {pastRecords.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No recent maintenance</p>
            ) : (
              pastRecords.map((maintenance) => (
                <div key={maintenance.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <h4>{maintenance.vehicleName}</h4>
                    <p className="text-sm text-muted-foreground">{maintenance.type} • {formatTimestamp(maintenance.date)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-accent">{formatCurrency(maintenance.cost)}</div>
                    <Badge className={maintenance.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'}>
                      {maintenance.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
