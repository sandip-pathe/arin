import { useRouter } from "next/navigation";
import { IoIosAddCircle } from "react-icons/io";

export default function CreateNotebookCard() {
  const router = useRouter();

  const handleCreate = () => {
    router.push(`/${crypto.randomUUID()}?new=true`);
  };

  return (
    <div
      onClick={handleCreate}
      className="text-4xl hover:text-5xl cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-200 p-4 rounded-lg flex flex-col items-center justify-center text-center text-muted-foreground"
    >
      <div className="bg-gray-100 rounded-full m-auto">
        <IoIosAddCircle className="transition-transform duration-200" />
      </div>
      <p className="font-medium text-base">Create new notebook</p>
    </div>
  );
}
