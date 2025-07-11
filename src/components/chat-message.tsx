'use client';

import { ChunkData } from '@/lib/ChatGPT+api';
import { FileText, FileImage, File, FileSpreadsheet, Check } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: Array<{ name: string; type: string }>;
  summary?: ChunkData;
  timestamp: Date;
}

export function ChatMessage({ message }: { message: Message }) {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <File className="h-4 w-4 text-red-500" />;
      case 'image': return <FileImage className="h-4 w-4 text-green-500" />;
      case 'text': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      case 'xlsx': return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      default: return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className={`mb-6 ${message.role === 'user' ? 'ml-auto max-w-[85%]' : 'mr-auto max-w-[85%]'}`}>
      <div className={`rounded-2xl p-4 ${message.role === 'user' ? 'bg-blue-50' : 'bg-gray-50'}`}>
        <div className="flex items-center mb-2">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
            message.role === 'user' ? 'bg-blue-500' : 'bg-gray-500'
          }`}>
            <span className="text-white font-bold">
              {message.role === 'user' ? 'U' : 'A'}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-500 mb-1">Attachments:</div>
            <div className="flex flex-wrap gap-2">
              {message.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center bg-blue-100 rounded px-2 py-1">
                  {getFileIcon(attachment.type)}
                  <span className="ml-1 text-xs max-w-[100px] truncate">{attachment.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {message.content && (
          <p className="text-gray-800 mb-3">{message.content}</p>
        )}
        
        {message.role === 'assistant' && message.summary && (
          <div className="mt-3 border-t pt-3">
            <div className="font-medium text-gray-700 mb-2">Document Summary:</div>
            <p className="text-gray-600 bg-yellow-50 p-3 rounded-lg">
              {message.summary.summary}
            </p>
            
            {message.summary.key_information && (
              <div className="mt-3">
                <div className="font-medium text-gray-700 mb-1">Key Information:</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Parties:</span>
                    {message.summary.key_information.parties.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {message.summary.key_information.parties.map((party, i) => (
                          <li key={i}>{party}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500 ml-2">None</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Dates:</span>
                    {message.summary.key_information.dates.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {message.summary.key_information.dates.map((date, i) => (
                          <li key={i}>{date}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500 ml-2">None</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Sections:</span>
                    {message.summary.key_information.sections.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {message.summary.key_information.sections.map((section, i) => (
                          <li key={i}>{section}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500 ml-2">None</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Amounts:</span>
                    {message.summary.key_information.amounts.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {message.summary.key_information.amounts.map((amount, i) => (
                          <li key={i}>{amount}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500 ml-2">None</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}