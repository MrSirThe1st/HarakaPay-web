'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { ParentSchoolMessageWithDetails } from '@/types/message.types';

export default function ParentMessages() {
  const [messages, setMessages] = useState<ParentSchoolMessageWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ParentSchoolMessageWithDetails | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchMessages = async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/messages/parent-to-school?page=${pageNum}&limit=20`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
        setUnreadCount(data.unreadCount);
        if (data.pagination) {
          setTotalPages(data.pagination.pages);
        }
      } else {
        setError(data.error || 'Failed to fetch messages');
      }
    } catch (err) {
      setError('Error fetching messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(page);
  }, [page]);

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/parent-to-school/${messageId}/read`, {
        method: 'PUT',
      });

      if (response.ok) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId
              ? { ...msg, status: 'read', read_at: new Date().toISOString() }
              : msg
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const handleMessageClick = (message: ParentSchoolMessageWithDetails) => {
    setSelectedMessage(message);
    if (message.status === 'unread') {
      handleMarkAsRead(message.id);
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Messages from Parents
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </h2>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No messages from parents yet
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                  message.status === 'unread' ? 'bg-blue-50 border-blue-200' : 'bg-white'
                }`}
                onClick={() => handleMessageClick(message)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{message.subject}</h3>
                      {message.status === 'unread' && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      From: {message.parent.first_name} {message.parent.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Regarding: {message.student.first_name} {message.student.last_name} ({message.student.grade_level})
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
                {selectedMessage?.id === message.id && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                    <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                      <p>Parent Contact: {message.parent.email}</p>
                      {message.parent.phone && <p>Phone: {message.parent.phone}</p>}
                      <p>Student ID: {message.student.student_id}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}