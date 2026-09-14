import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Plus, Edit, Trash2, Upload, Car, DollarSign, Gauge, Fuel, Calendar, History, Loader2, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../ui/utils';
import { getDocuments, addDocument, updateDocument, deleteDocument } from '../../firebase';

interface VehicleManagementPageProps {
  user: any;
  gpsVehicleId?: string;
}

interface Vehicle {
  id: string;
  name: string;
  model: string;
  year: number;
  licensePlate: string;
  dailyRate: number;
  hourlyRate: number;
  type: string;
  fuelType: string;
  seats: number;
  transmission: string;
  status: string;
  mileage: number;
  image: string;
  description: string;
  maintenanceHistory: MaintenanceRecord[];
  rentalHistory: RentalRecord[];
}

interface MaintenanceRecord {
  date: string;
  type: string;
  description: string;
  cost: number;
  performedBy: string;
}

interface RentalRecord {
  bookingId: string;
  customerName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  revenue: number;
}

export function VehicleManagementPage({ user, gpsVehicleId }: VehicleManagementPageProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    dailyRate: 0,
    hourlyRate: 0,
    type: 'Sedan',
    fuelType: 'Gasoline',
    seats: 5,
    transmission: 'Automatic',
    description: '',
    image: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const data = await getDocuments('vehicles');
      setVehicles(data as Vehicle[]);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVehicle = async () => {
    try {
      const newVehicleData = {
        ...formData,
        status: 'Available',
        mileage: 0,
        maintenanceHistory: [],
        rentalHistory: []
      };

      const createdVehicle = await addDocument('vehicles', newVehicleData);
      setVehicles([...vehicles, { id: createdVehicle.id, ...newVehicleData } as Vehicle]);
      setShowAddModal(false);
      resetForm();
      alert('Vehicle added successfully!');
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert('Failed to add vehicle');
    }
  };

  const handleEditVehicle = async () => {
    if (selectedVehicle) {
      try {
        const updateData: any = { ...formData };

        // If status changed to Maintenance, ensure it is set
        await updateDocument('vehicles', selectedVehicle.id, updateData);

        setVehicles(vehicles.map(v =>
          v.id === selectedVehicle.id
            ? { ...v, ...updateData }
            : v
        ));
        setShowEditModal(false);
        setSelectedVehicle(null);
        resetForm();
        alert('Vehicle updated successfully!');
      } catch (error) {
        console.error('Error updating vehicle:', error);
        alert('Failed to update vehicle');
      }
    }
  };

  const confirmDeleteVehicle = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setShowDeleteModal(true);
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    try {
      setIsDeleting(true);
      await deleteDocument('vehicles', vehicleToDelete.id);
      setVehicles(vehicles.filter(v => v.id !== vehicleToDelete.id));
      setShowDeleteModal(false);
      setVehicleToDelete(null);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Failed to delete vehicle');
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      dailyRate: vehicle.dailyRate,
      hourlyRate: vehicle.hourlyRate,
      type: vehicle.type,
      fuelType: vehicle.fuelType,
      seats: vehicle.seats,
      transmission: vehicle.transmission,
      description: vehicle.description,
      image: vehicle.image
    });
    setShowEditModal(true);
  };

  const openHistoryModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowHistoryModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      dailyRate: 0,
      hourlyRate: 0,
      type: 'Sedan',
      fuelType: 'Gasoline',
      seats: 5,
      transmission: 'Automatic',
      description: '',
      image: ''
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const getTotalRevenue = (vehicle: Vehicle) => {
    return vehicle.rentalHistory.reduce((sum, record) => sum + record.revenue, 0);
  };

  const getTotalMaintenanceCost = (vehicle: Vehicle) => {
    return vehicle.maintenanceHistory.reduce((sum, record) => sum + record.cost, 0);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-red-600 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading vehicle fleet...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-red-600">Vehicle Management</h2>
        <Button
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Vehicles</p>
                <p className="text-2xl font-bold">{vehicles.length}</p>
              </div>
              <Car className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {vehicles.filter(v => v.status === 'Available').length}
                </p>
              </div>
              <Car className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rented</p>
                <p className="text-2xl font-bold text-blue-600">
                  {vehicles.filter(v => v.status === 'Rented').length}
                </p>
              </div>
              <Car className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {vehicles.filter(v => v.status === 'Maintenance').length}
                </p>
              </div>
              <Car className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="overflow-hidden">
            <img
              src={vehicle.image}
              alt={vehicle.name}
              className="w-full h-48 object-cover"
            />
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg">{vehicle.name}</h3>
                  <p className="text-sm text-muted-foreground">{vehicle.model}</p>
                  <p className="text-xs text-muted-foreground">{vehicle.licensePlate}</p>
                  {vehicle.id === gpsVehicleId && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span>
                      GPS ENABLED
                    </span>
                  )}
                </div>
                <Badge className={
                  vehicle.status === 'Available' ? 'bg-green-500' :
                    vehicle.status === 'Rented' ? 'bg-blue-500' :
                      'bg-yellow-500'
                }>
                  {vehicle.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-red-600" />
                  <span>{formatCurrency(vehicle.dailyRate)}/day</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span>{formatCurrency(vehicle.hourlyRate)}/hr</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-gray-600" />
                  <span>{vehicle.mileage} mi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span>{vehicle.year}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">{vehicle.description}</p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openHistoryModal(vehicle)}
                >
                  <History className="h-4 w-4 mr-1" />
                  History
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(vehicle)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => confirmDeleteVehicle(vehicle)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {showAddModal ? 'Add New Vehicle' : 'Edit Vehicle'}
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Vehicle Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Tesla Model 3"
                    />
                  </div>
                  <div>
                    <Label>Model</Label>
                    <Input
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="Long Range AWD"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>License Plate</Label>
                    <Input
                      value={formData.licensePlate}
                      onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                      placeholder="ABC-1234"
                    />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Daily Rate (LKR)</Label>
                    <Input
                      type="number"
                      value={formData.dailyRate}
                      onChange={(e) => setFormData({ ...formData, dailyRate: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Hourly Rate (LKR)</Label>
                    <Input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={formData.type} onValueChange={(value: string) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sedan">Sedan</SelectItem>
                        <SelectItem value="SUV">SUV</SelectItem>
                        <SelectItem value="Luxury">Luxury</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Electric">Electric</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fuel Type</Label>
                    <Select value={formData.fuelType} onValueChange={(value: string) => setFormData({ ...formData, fuelType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gasoline">Gasoline</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="Electric">Electric</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Seats</Label>
                    <Input
                      type="number"
                      value={formData.seats}
                      onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the vehicle..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Vehicle Image</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="flex-1"
                    />
                    <Button variant="outline" type="button">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.image && (
                    <img src={formData.image} alt="Preview" className="mt-2 h-32 w-full object-cover rounded" />
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={showAddModal ? handleAddVehicle : handleEditVehicle}
                  >
                    {showAddModal ? 'Add Vehicle' : 'Update Vehicle'}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setSelectedVehicle(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">
                  {selectedVehicle.name} - Complete History
                </h3>
                <Button variant="outline" onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedVehicle(null);
                }}>
                  Close
                </Button>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-green-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(getTotalRevenue(selectedVehicle))}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Maintenance Cost</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(getTotalMaintenanceCost(selectedVehicle))}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Rentals</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedVehicle.rentalHistory.length}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Rental History */}
              <div className="mb-6">
                <h4 className="font-bold mb-4 text-red-600">Rental History</h4>
                <div className="space-y-2">
                  {selectedVehicle.rentalHistory.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No rental history</p>
                  ) : (
                    selectedVehicle.rentalHistory.map((record, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Booking:</span>
                              <p className="font-medium">{record.bookingId}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Customer:</span>
                              <p className="font-medium">{record.customerName}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Period:</span>
                              <p className="font-medium">{record.startDate} to {record.endDate}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Days:</span>
                              <p className="font-medium">{record.totalDays}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Revenue:</span>
                              <p className="font-bold text-green-600">{formatCurrency(record.revenue)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Maintenance History */}
              <div>
                <h4 className="font-bold mb-4 text-red-600">Maintenance History</h4>
                <div className="space-y-2">
                  {selectedVehicle.maintenanceHistory.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No maintenance history</p>
                  ) : (
                    selectedVehicle.maintenanceHistory.map((record, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Date:</span>
                              <p className="font-medium">{record.date}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Type:</span>
                              <p className="font-medium">{record.type}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Performed By:</span>
                              <p className="font-medium">{record.performedBy}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Cost:</span>
                              <p className="font-bold text-red-600">{formatCurrency(record.cost)}</p>
                            </div>
                            <div className="col-span-2 md:col-span-4">
                              <span className="text-muted-foreground">Description:</span>
                              <p className="font-medium">{record.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && vehicleToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Vehicle</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 font-medium">
                  Are you sure you want to delete:
                </p>
                <p className="text-base font-bold text-red-700 mt-1">
                  {vehicleToDelete.name}
                  <span className="font-normal text-gray-500 text-sm ml-2">({vehicleToDelete.licensePlate})</span>
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setVehicleToDelete(null);
                  }}
                  disabled={isDeleting}
                >
                  No, Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDeleteVehicle}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Yes, Delete
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
