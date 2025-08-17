import React from "react";

const StatCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-3 animate-pulse">
      <div className="h-6 w-6 rounded-full bg-gray-200" />{" "}
      {/* icon placeholder */}
      <div className="h-4 bg-gray-200 rounded w-2/3" /> {/* label */}
      <div className="h-6 bg-gray-200 rounded w-1/2" /> {/* value */}
    </div>
  );
};

export default StatCardSkeleton;
