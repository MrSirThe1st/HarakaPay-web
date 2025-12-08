'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { SupportTicketWithDetails } from '@/types/message.types';

export default function SchoolMessages() {
  const [tickets, setTickets] = useState<SupportTicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketWithDetails | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openCount, setOpenCount] = useState(0);

  const fetchTickets = async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/messages/school-to-admin?page=${pageNum}&limit=20`);
      const data = await response.json();

      if (data.success) {
        setTickets(data.tickets);
        setOpenCount(data.openCount);
        if (data.pagination) {
          setTotalPages(data.pagination.pages);
        }
      } else {
        setError(data.error || 'Failed to fetch support tickets');
      }
    } catch (err) {
      setError('Error fetching support tickets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(page);
  }, [page]);

  const handleResolveTicket = async (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/messages/school-to-admin/${ticketId}/read`, {
        method: 'PUT',
      });

      if (response.ok) {
        setTickets(prev =>
          prev.map(ticket =>
            ticket.id === ticketId
              ? { ...ticket, status: 'resolved', resolved_at: new Date().toISOString() }
              : ticket
          )
        );
        setOpenCount(prev => Math.max(0, prev - 1));
        setSelectedTicket(null);
      }
    } catch (err) {
      console.error('Error resolving ticket:', err);
    }
  };

  const handleTicketClick = (ticket: SupportTicketWithDetails) => {
    if (selectedTicket?.id === ticket.id) {
      setSelectedTicket(null);
    } else {
      setSelectedTicket(ticket);
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
          Support Tickets from Schools
          {openCount > 0 && (
            <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              {openCount} open
            </span>
          )}
        </h2>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No support tickets from schools yet
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                  ticket.status === 'open' ? 'bg-orange-50 border-orange-200' : 'bg-white'
                }`}
                onClick={() => handleTicketClick(ticket)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                      {ticket.status === 'open' && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded">
                          Open
                        </span>
                      )}
                      {ticket.status === 'resolved' && (
                        <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      From: {ticket.school.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Submitted by: {ticket.submitter.first_name} {ticket.submitter.last_name}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {format(new Date(ticket.created_at), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
                {selectedTicket?.id === ticket.id && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-gray-700 whitespace-pre-wrap mb-4">{ticket.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        {ticket.resolved_at && (
                          <p className="text-xs text-gray-500">
                            Resolved: {format(new Date(ticket.resolved_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        )}
                      </div>
                      {ticket.status === 'open' && (
                        <button
                          onClick={(e) => handleResolveTicket(ticket.id, e)}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Mark as Resolved
                        </button>
                      )}
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
