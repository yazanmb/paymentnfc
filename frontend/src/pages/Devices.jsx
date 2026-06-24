import { useState, useEffect } from 'react';
import { devicesAPI, branchesAPI, transactionsAPI } from '../services/api';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [lastTap, setLastTap] = useState(null);
  const [formData, setFormData] = useState({
    branch_id: '',
    device_uid: '',
    device_name: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [devicesRes, branchesRes] = await Promise.all([
        devicesAPI.getAll().catch(() => ({ data: [] })),
        branchesAPI.getAll().catch(() => ({ data: [] })),
      ]);
      setDevices(devicesRes.data || []);
      setBranches(branchesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomUID = () => {
    // Generate a random 8-character hex UID
    return Math.random().toString(16).substring(2, 10).toUpperCase();
  };

  const handleActivate = async (e) => {
    e.preventDefault();
    try {
      await devicesAPI.activate(formData);
      setShowModal(false);
      setFormData({ branch_id: '', device_uid: '', device_name: '' });
      fetchData();
    } catch (error) {
      console.error('Error activating device:', error);
      alert('Error activating device');
    }
  };

  const handleSimulateNFCTap = async (device) => {
    if (!device.is_active) {
      alert('Device must be active to simulate NFC tap');
      return;
    }

    setSimulating(true);
    const nfcUid = generateRandomUID();
    
    try {
      // Create a test payment
      await transactionsAPI.create({
        device_uid: device.device_uid,
        amount: 10.00,
        currency: 'USD',
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        nfc_uid: nfcUid,
      });

      setLastTap({
        device_uid: device.device_uid,
        nfc_uid: nfcUid,
        timestamp: new Date(),
      });

      alert(`NFC Tap Simulated!\nDevice: ${device.device_name}\nNFC UID: ${nfcUid}`);
      fetchData();
    } catch (error) {
      console.error('Error simulating NFC tap:', error);
      alert('Error simulating NFC tap');
    } finally {
      setSimulating(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await devicesAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting device:', error);
        alert('Error deleting device');
      }
    }
  };

  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.branch_name : 'Unknown';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Devices</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Device
        </button>
      </div>

      {lastTap && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 font-semibold">Last NFC Tap Simulated</p>
              <p className="text-green-700 text-sm mt-1">
                Device: {lastTap.device_uid} | NFC UID: {lastTap.nfc_uid}
              </p>
              <p className="text-green-600 text-xs mt-1">
                {lastTap.timestamp.toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setLastTap(null)}
              className="text-green-600 hover:text-green-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device UID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Branch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Seen
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {devices.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No devices found. Add your first device to get started.
                </td>
              </tr>
            ) : (
              devices.map((device) => (
                <tr key={device.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{device.device_name || 'NFC Device'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">{device.device_uid}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getBranchName(device.branch_id)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      device.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {device.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {device.last_seen ? new Date(device.last_seen).toLocaleString() : 'Never'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleSimulateNFCTap(device)}
                      disabled={simulating}
                      className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:opacity-50"
                    >
                      {simulating ? 'Simulating...' : 'Simulate NFC'}
                    </button>
                    <button
                      onClick={() => handleDelete(device.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Add New Device</h2>
            <form onSubmit={handleActivate}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Branch
                </label>
                <select
                  required
                  value={formData.branch_id}
                  onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branch_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Device UID
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    value={formData.device_uid}
                    onChange={(e) => setFormData({ ...formData, device_uid: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., A1B2C3D4"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, device_uid: generateRandomUID() })}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Device Name
                </label>
                <input
                  type="text"
                  value={formData.device_name}
                  onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Main Counter Device"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices;
