import React from "react";
import { CreateProjectRequest, ProjectDto } from "../../shared/types/project";

interface CreateProjectModalProps {
  showModal: boolean;
  newProject: CreateProjectRequest;
  onClose: () => void;
  onInputChange: (field: keyof CreateProjectRequest, value: any) => void;
  onCreateProject: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  showModal,
  newProject,
  onClose,
  onInputChange,
  onCreateProject,
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Create New Solar Project
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-8">
          <form className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                📋 Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={newProject.projectName}
                    onChange={(e) =>
                      onInputChange("projectName", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="โรงพยาบาลปากน้ำ"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={newProject.address}
                    onChange={(e) => onInputChange("address", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ต.บางหญ้าแพรก อ.เมืองสมุทรสาคร จ.สมุทรสาคร 74000"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Information *
                  </label>
                  <input
                    type="text"
                    value={newProject.clientInfo || ""}
                    onChange={(e) =>
                      onInputChange("clientInfo", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="โรงพยาบาลประจำจังหวัดสมุทรสาคร"
                  />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-50 p-6 rounded-xl border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                📅 Timeline
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => onInputChange("startDate", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated End Date
                  </label>
                  <input
                    type="date"
                    value={newProject.estimatedEndDate || ""}
                    onChange={(e) =>
                      onInputChange("estimatedEndDate", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                ⚡ Technical Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Capacity (kW)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newProject.totalCapacityKw || 0}
                    onChange={(e) =>
                      onInputChange(
                        "totalCapacityKw",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="875.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PV Module Count
                  </label>
                  <input
                    type="number"
                    value={newProject.pvModuleCount || 0}
                    onChange={(e) =>
                      onInputChange(
                        "pvModuleCount",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Connection Type
                  </label>
                  <select
                    value={newProject.connectionType || "LV"}
                    onChange={(e) =>
                      onInputChange("connectionType", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="LV">LV - Low Voltage</option>
                    <option value="MV">MV - Medium Voltage</option>
                    <option value="HV">HV - High Voltage</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                💰 Financial Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    FTS Value (฿)
                  </label>
                  <input
                    type="number"
                    value={newProject.ftsValue || 0}
                    onChange={(e) =>
                      onInputChange("ftsValue", parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="16200000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Revenue Value (฿)
                  </label>
                  <input
                    type="number"
                    value={newProject.revenueValue || 0}
                    onChange={(e) =>
                      onInputChange(
                        "revenueValue",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="19440000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PQM Value (฿)
                  </label>
                  <input
                    type="number"
                    value={newProject.pqmValue || 0}
                    onChange={(e) =>
                      onInputChange("pqmValue", parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="3240000"
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 p-6 rounded-xl border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                📍 Location & Connection
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newProject.latitude || 0}
                    onChange={(e) =>
                      onInputChange("latitude", parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="13.5619"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newProject.longitude || 0}
                    onChange={(e) =>
                      onInputChange(
                        "longitude",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="100.2743"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Connection Notes
                  </label>
                  <textarea
                    value={newProject.connectionNotes || ""}
                    onChange={(e) =>
                      onInputChange("connectionNotes", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ระบบจำหน่ายแรงสูง 22 kV"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onCreateProject}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-bold shadow-lg"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
