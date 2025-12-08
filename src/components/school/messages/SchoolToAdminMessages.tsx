'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { SupportTicketWithDetails } from '@/types/message.types';

export default function SchoolToAdminMessages() {
  const [tickets, setTickets] = useState<SupportTicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTickets = async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/messages/school-to-admin?page=${pageNum}&limit=20`);
      const data = await response.json();

      if (data.success) {
        setTickets(data.tickets);
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

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!subject.trim() || !description.trim()) {
      setError('Subject and description required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/messages/school-to-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, description }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Support ticket submitted successfully');
        setSubject('');
        setDescription('');
        setShowForm(false);
        fetchTickets(1);
        setPage(1);
      } else {
        setError(data.error || 'Failed to submit ticket');
      }
    } catch (err) {
      setError('Error submitting ticket');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Support Tickets</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Submit Support Ticket'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmitTicket} className="bg-white border rounded-lg p-6 space-y-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              maxLength={255}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Describe your issue or request in detail..."
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && tickets.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No support tickets submitted yet
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                    <p className="text-sm text-gray-500">
                      Submitted by: {ticket.submitter.first_name} {ticket.submitter.last_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {format(new Date(ticket.created_at), 'MMM d, yyyy h:mm a')}
                    </div>
                    <span
                      className={`inline-block text-xs px-2 py-1 rounded mt-1 ${
                        ticket.status === 'open'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {ticket.status === 'open' ? 'Open' : 'Resolved'}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap mt-2">{ticket.description}</p>
                {ticket.resolved_at && (
                  <p className="text-xs text-gray-500 mt-2">
                    Resolved: {format(new Date(ticket.resolved_at), 'MMM d, yyyy h:mm a')}
                  </p>
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