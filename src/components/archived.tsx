import { FC } from "react";
import { LuArchive } from "react-icons/lu";

interface Props {
  count: number;
  onClick: () => void;
  onToggleStar: () => void;
}

const ArchivedNotebookCard: FC<Props> = ({ count, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer bg-white border border-gray-200 p-4 rounded-lg hover:border-blue-300 hover:shadow-md transition"
    >
      {/* Large archive icon */}
      <div className="flex items-center justify-center h-32 text-gray-400 text-6xl">
        <LuArchive />
      </div>

      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-gray-800 opacity-30 rounded-lg pointer-events-none" />

      {/* Count on top of overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-bold text-lg">
        {count} Archived
      </div>
    </div>
  );
};

export default ArchivedNotebookCard;
