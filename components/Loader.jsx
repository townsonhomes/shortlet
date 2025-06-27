// components/Loader.jsx
import { ClipLoader } from "react-spinners";

export default function Loader() {
  return (
    <div className="min-h-[50vh] flex justify-center items-center">
      <ClipLoader size={50} color="#FACC15" speedMultiplier={1.2} />
    </div>
  );
}
