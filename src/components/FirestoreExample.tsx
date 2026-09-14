import { useState, useEffect } from 'react';
import { getDocuments, addDocument, updateDocument, deleteDocument, where } from '../firebase';

/**
 * Example Firestore Component
 * This demonstrates how to use Firebase Firestore in your components
 * 
 * You can adapt this pattern for managing cars, bookings, etc.
 */

interface Car {
    id?: string;
    make: string;
    model: string;
    year: number;
    pricePerDay: number;
    available: boolean;
}

export const FirestoreExample = () => {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<Car>({
        make: '',
        model: '',
        year: 2024,
        pricePerDay: 0,
        available: true
    });

    // Load cars on component mount
    useEffect(() => {
        loadCars();
    }, []);

    const loadCars = async () => {
        try {
            setLoading(true);
            const data = await getDocuments('cars');
            setCars(data as Car[]);
        } catch (error) {
            console.error('Error loading cars:', error);
            alert('Failed to load cars');
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableCars = async () => {
        try {
            setLoading(true);
            const data = await getDocuments('cars', where('available', '==', true));
            setCars(data as Car[]);
        } catch (error) {
            console.error('Error loading available cars:', error);
            alert('Failed to load available cars');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCar = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addDocument('cars', formData);
            alert('Car added successfully!');
            setFormData({
                make: '',
                model: '',
                year: 2024,
                pricePerDay: 0,
                available: true
            });
            loadCars(); // Reload the list
        } catch (error) {
            console.error('Error adding car:', error);
            alert('Failed to add car');
        }
    };

    const handleToggleAvailability = async (car: Car) => {
        if (!car.id) return;
        try {
            await updateDocument('cars', car.id, {
                available: !car.available
            });
            alert('Car updated successfully!');
            loadCars(); // Reload the list
        } catch (error) {
            console.error('Error updating car:', error);
            alert('Failed to update car');
        }
    };

    const handleDeleteCar = async (carId: string) => {
        if (!confirm('Are you sure you want to delete this car?')) return;
        try {
            await deleteDocument('cars', carId);
            alert('Car deleted successfully!');
            loadCars(); // Reload the list
        } catch (error) {
            console.error('Error deleting car:', error);
            alert('Failed to delete car');
        }
    };

    if (loading) {
        return <div className="p-4">Loading cars...</div>;
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Firestore Example - Car Management</h2>

            {/* Add Car Form */}
            <form onSubmit={handleAddCar} className="bg-gray-100 p-4 rounded mb-6">
                <h3 className="text-xl font-semibold mb-3">Add New Car</h3>
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Make (e.g., Toyota)"
                        value={formData.make}
                        onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Model (e.g., Camry)"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Year"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Price per Day"
                        value={formData.pricePerDay}
                        onChange={(e) => setFormData({ ...formData, pricePerDay: parseFloat(e.target.value) })}
                        className="p-2 border rounded"
                        required
                    />
                </div>
                <div className="mt-4 flex gap-2">
                    <button
                        type="submit"
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                    >
                        Add Car
                    </button>
                    <button
                        type="button"
                        onClick={loadAvailableCars}
                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                    >
                        Show Available Only
                    </button>
                    <button
                        type="button"
                        onClick={loadCars}
                        className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                    >
                        Show All Cars
                    </button>
                </div>
            </form>

            {/* Cars List */}
            <div>
                <h3 className="text-xl font-semibold mb-3">Cars ({cars.length})</h3>
                {cars.length === 0 ? (
                    <p className="text-gray-500">No cars found. Add one above!</p>
                ) : (
                    <div className="space-y-2">
                        {cars.map((car) => (
                            <div
                                key={car.id}
                                className="bg-white border rounded p-4 flex justify-between items-center"
                            >
                                <div>
                                    <h4 className="font-semibold">
                                        {car.year} {car.make} {car.model}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        ${car.pricePerDay}/day • {car.available ? '✅ Available' : '❌ Not Available'}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleToggleAvailability(car)}
                                        className="bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600"
                                    >
                                        Toggle
                                    </button>
                                    <button
                                        onClick={() => car.id && handleDeleteCar(car.id)}
                                        className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
