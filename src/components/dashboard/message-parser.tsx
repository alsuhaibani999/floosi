import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { MessageParserModal } from '../modals/message-parser-modal';

interface ParsedMessage {
  amount: number;
  type: 'deposit' | 'withdrawal';
  isExpense: boolean;
  date: string;
  bankName: string | null;
}

export const MessageParser: React.FC = () => {
  const [message, setMessage] = useState('');
  const [parsedData, setParsedData] = useState<ParsedMessage | null>(null);
  const [showModal, setShowModal] = useState(false);

  const parseMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest('POST', '/api/parse-message', { message });
      return res.json();
    },
    onSuccess: (data: ParsedMessage) => {
      setParsedData(data);
      setShowModal(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      parseMutation.mutate(message);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setParsedData(null);
  };

  return (
    <>
      <div className="mt-6 bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-bold mb-4">تحليل الرسائل البنكية</h3>
        
        <div className="bg-gray-50 rounded-lg p-4 border border-dashed border-gray-200">
          <p className="text-gray-500 text-sm mb-3">قم بنسخ ولصق الرسالة البنكية هنا للتحليل التلقائي</p>
          
          <form onSubmit={handleSubmit}>
            <Textarea 
              className="w-full h-24 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="مثال: تم إيداع مبلغ 2000 ريال في حسابك لدى مصرف الراجحي بتاريخ 14/06/2023"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            
            <div className="mt-3">
              <Button 
                type="submit"
                className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                disabled={parseMutation.isPending || !message.trim()}
              >
                {parseMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <i className="ri-loader-4-line animate-spin"></i>
                    جاري التحليل...
                  </span>
                ) : (
                  "تحليل الرسالة"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Message Parser Modal */}
      {parsedData && (
        <MessageParserModal 
          isOpen={showModal}
          onClose={handleCloseModal}
          parsedData={parsedData}
        />
      )}
    </>
  );
};
