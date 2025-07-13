import { Message } from '@/app/page';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { FileText, FileImage, File } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={`flex gap-4 p-4 ${message.role === 'user' ? 'bg-white' : 'bg-gray-50'} rounded-lg`}>
      <Avatar className="h-8 w-8">
        <AvatarFallback className={message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}>
          {message.role === 'user' ? 'U' : 'A'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="font-medium">
            {message.role === 'user' ? 'You' : 'Legal Assistant'}
          </span>
          <span className="text-xs text-gray-500">
            {format(message.timestamp, 'hh:mm a')}
          </span>
        </div>
        
        {message!.attachments!?.length! > 0 && (
          <div className="mb-3">
            <span className="text-xs text-gray-500">Attachments:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {message!.attachments!.map((attachment: any, i: any) => (
                <span key={i} className="text-xs bg-blue-50 px-2 py-1 rounded flex items-center">
                  {attachment.type === 'pdf' ? (
                    <FileText className="h-3 w-3 mr-1" />
                  ) : attachment.type === 'image' ? (
                    <FileImage className="h-3 w-3 mr-1" />
                  ) : (
                    <File className="h-3 w-3 mr-1" />
                  )}
                  {attachment.name}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {message.summary ? (
          <div className="text-sm">
            {message.content}
          </div>
        ) : (
          <div className="text-sm">
            {message.content}
          </div>
        )}
      </div>
    </div>
  );
}