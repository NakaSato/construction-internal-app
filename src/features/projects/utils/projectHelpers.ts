export const getStatusBadgeColor = (status: string | null) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "bg-blue-100 text-blue-800";
    case "inprogress":
      return "bg-blue-100 text-blue-800";
    case "planning":
      return "bg-yellow-100 text-yellow-800";
    case "onhold":
      return "bg-orange-100 text-orange-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const formatDate = (dateString: string | null) => {
  if (!dateString) return "Not set";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatCurrency = (value: number | null) => {
  if (value === null || value === undefined) return "Not specified";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

export const calculateProgress = (
  completedTaskCount: number,
  taskCount: number
) => {
  if (!taskCount || taskCount === 0) return 0;
  return Math.round((completedTaskCount / taskCount) * 100);
};
