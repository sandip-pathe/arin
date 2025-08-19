// components/notebook-card.tsx
import { FC } from "react";
import {
  FiUsers,
  FiFolder,
  FiArchive,
  FiTrash2,
  FiMove,
  FiShare2,
  FiClock,
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
  isShared: boolean;
  folder: string;
  sharedCount: number;
  onClick: () => void;
  onMoveToFolder: (folder: string) => void;
  onDelete: () => void;
  onArchive: () => void;
  onShare: () => void;
}

const NotebookCard: FC<Props> = ({
  title,
  updatedAt,
  sharedCount,
  onClick,
  onArchive,
  onMoveToFolder,
  onDelete,
  onShare,
  isShared,
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          onClick={onClick}
          className="group cursor-pointer select-none rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 p-4 flex flex-col justify-between h-40"
        >
          {/* Title */}
          <h3 className="font-semibold text-lg text-neutral-900 line-clamp-2 flex-1 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          {/* Footer metadata */}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <FiClock size={14} className="text-gray-400" />
                <span>
                  {new Date(updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              {sharedCount > 0 && (
                <div className="flex items-center gap-1">
                  <FiUsers size={14} className="text-gray-400" />
                  <span>{sharedCount}</span>
                </div>
              )}
            </div>

            {/* Quick action (share for now) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-blue-50"
            >
              <FiShare2 size={16} className="text-blue-600" />
            </button>
          </div>
        </div>
      </ContextMenuTrigger>

      {/* Context Menu */}
      <ContextMenuContent className="w-48">
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
          <ContextMenuSubContent className="w-48">
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
