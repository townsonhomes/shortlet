import User from "@/models/User";

export const getAllUsers = async () => {
  const users = await User.find({ role: "user" })
    .sort({ createdAt: -1 })
    .lean();

  return users.map((user) => ({
    _id: user._id.toString(),
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    gender: user.gender || "",
    nationality: user.nationality || "",
    state: user.state || "",
    address: user.address || "",
    isEmailVerified: user.isEmailVerified,
    isIdVerified: user.isIdVerified || false,
    idType: user.idType || "",
    idImage: user.idImage || "",
    createdAt: user.createdAt.toISOString(),
  }));
};
