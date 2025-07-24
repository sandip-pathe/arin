// components/notebook-card.tsx
import { FC } from "react";
import {
  FiStar,
  FiUsers,
  FiFolder,
  FiArchive,
  FiTrash2,
  FiMove,
  FiShare2,
} from "react-icons/fi";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface Props {
  id: string;
  title: string;
  updatedAt: number;
  isStarred: boolean;
  folder: string;
  sharedCount: number;
  onClick: () => void;
  onToggleStar: () => void;
  onMoveToFolder: (folder: string) => void;
  onDelete: () => void;
  onArchive: () => void;
  onShare: () => void;
}

const NotebookCard: FC<Props> = ({
  title,
  updatedAt,
  isStarred,
  sharedCount,
  onClick,
  onArchive,
  onToggleStar,
  onMoveToFolder,
  onDelete,
  onShare,
  folder,
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          onClick={onClick}
          className={`cursor-pointer transition-all rounded-lg hover:border-blue-300 bg-background mb-4 flex flex-row items-center border-none justify-between p-2`}
        >
          <div className="border-r border-gray-400 flex flex-1 flex-row items-center justify-start text-center p-2 gap-4">
            <h3 className="font-semibold text-xl line-clamp-2">{title}</h3>

            <p className="text-xs text-gray-400">
              {new Date(updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>

            {/* Folder and shared info */}
            <div className="flex items-center text-sm text-gray-500 mt-2 gap-2">
              {sharedCount > 0 && (
                <div className="flex items-center ml-2">
                  <FiUsers className="text-gray-400 mr-1" />
                  <span>{sharedCount}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center w-16">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar();
              }}
              className="p-1 rounded-full mx-auto hover:bg-yellow-50 z-10 border-l border-gray-200"
              aria-label={isStarred ? "Unstar" : "Star"}
            >
              <FiStar
                className={`${
                  isStarred
                    ? "text-yellow-500 fill-yellow-400"
                    : "text-gray-500 hover:text-yellow-400"
                } transition-colors`}
                size={18}
              />
            </button>
            <FiShare2
              className="mx-auto text-gray-500 cursor-pointer hover:text-blue-600 transition"
              size={18}
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
            />
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-48">
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar();
          }}
        >
          <FiStar className="mr-2" size={16} />
          {isStarred ? "Unstar" : "Star"}
        </ContextMenuItem>

        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onShare();
          }}
        >
          <FiShare2 className="mr-2" size={16} />
          Share
        </ContextMenuItem>

        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onArchive();
          }}
        >
          <FiArchive className="mr-2" size={16} />
          Archive
        </ContextMenuItem>

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <div className="flex items-start w-full">
              <FiMove className="mr-2" size={16} />
              Move to
            </div>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48 ">
            <ContextMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onMoveToFolder("personal");
              }}
            >
              <FiFolder className="mr-2 text-blue-500" size={16} />
              Personal
            </ContextMenuItem>
            <ContextMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onMoveToFolder("shared");
              }}
            >
              <FiUsers className="mr-2 text-green-500" size={16} />
              Shared
            </ContextMenuItem>
            <ContextMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onMoveToFolder("archived");
              }}
            >
              <FiArchive className="mr-2 text-gray-500" size={16} />
              Archived
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        <ContextMenuItem
          className="text-red-500 focus:text-red-600"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <FiTrash2 className="mr-2" size={16} />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default NotebookCard;
