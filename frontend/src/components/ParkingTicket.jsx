import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ParkingTicket = ({ booking, onClose }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateEndTime = (startTime, durationHours) => {
    const end = new Date(startTime);
    end.setHours(end.getHours() + durationHours);
    return end;
  };

  const generateTicketNumber = (bookingId) => {
    const shortId = bookingId.slice(-8).toUpperCase();
    return `PKG-${shortId}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const element = document.getElementById('parking-ticket');
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 24;
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    pdf.setProperties({
      title: `Parking Ticket - ${generateTicketNumber(booking._id || booking.id)}`,
      subject: 'Parkly Parking Ticket',
      creator: 'Parkly',
    });

    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight - margin * 2;

    while (heightLeft > 0) {
      pdf.addPage();
      position = margin - (imgHeight - heightLeft);
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight - margin * 2;
    }

    const ticketNo = generateTicketNumber(booking._id || booking.id);
    pdf.save(`ParkingTicket_${ticketNo}.pdf`);
  };

  const endTime = calculateEndTime(booking.startTime, booking.durationHours);
  const ticketNumber = generateTicketNumber(booking._id || booking.id);

  const modalContent = (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        zIndex: 10000,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl"
      >
        {/* Compact Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100 no-print">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Parkly</h2>
              <p className="text-xs text-gray-500">Parking Ticket</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        {/* Ticket Content */}
        <div id="parking-ticket" className="px-8 py-6">
          {/* Ticket Number - Compact */}
          <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-100">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Ticket Number</p>
              <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                {ticketNumber}
              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              booking.status === 'confirmed' ? 'bg-blue-50 text-blue-700' :
              booking.status === 'completed' ? 'bg-green-50 text-green-700' :
              booking.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
              'bg-red-50 text-red-700'
            }`}>
              {(booking.status || 'pending').toUpperCase()}
            </div>
          </div>

          {/* Two Column Grid - Space Efficient */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-6">
            {/* Location */}
            <div className="col-span-2">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-1.5 rounded-lg bg-purple-50">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Location</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{booking.parkingSpot?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {booking.parkingSpot?.address?.fullAddress || 'Address not available'}
                    {booking.parkingSpot?.address?.city && `, ${booking.parkingSpot.address.city}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicle */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Vehicle</p>
              <p className="text-sm font-bold text-gray-900">{booking.vehicleNumber || 'N/A'}</p>
              <p className="text-xs text-gray-600">
                {booking.vehicleType ? String(booking.vehicleType).replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}
              </p>
            </div>

            {/* Customer */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Customer</p>
              <p className="text-sm font-bold text-gray-900 truncate">{booking.customerName || 'N/A'}</p>
              <p className="text-xs text-gray-600">{booking.customerPhone || 'N/A'}</p>
            </div>

            {/* Start */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Start</p>
              <p className="text-sm font-bold text-gray-900">{formatDate(booking.startTime)}</p>
              <p className="text-xs text-green-600 font-semibold">{formatTime(booking.startTime)}</p>
            </div>

            {/* End */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">End</p>
              <p className="text-sm font-bold text-gray-900">{formatDate(endTime)}</p>
              <p className="text-xs text-orange-600 font-semibold">{formatTime(endTime)}</p>
            </div>

            {/* Duration */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Duration</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {booking.durationHours}<span className="text-sm text-gray-600 ml-1">hrs</span>
              </p>
            </div>

            {/* Payment */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Payment</p>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                  {booking.paymentMethod}
                </span>
                <span className={`text-xs font-bold ${
                  booking.paymentStatus === 'paid' ? 'text-green-600' :
                  booking.paymentStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {booking.paymentStatus?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Amount - Premium Display */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-5 mb-5">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10"></div>
            <div className="relative flex items-baseline justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Total Amount</p>
                <p className="text-4xl font-bold text-white tracking-tight">₹{booking.amount}</p>
              </div>
              <div className="text-right">
                {booking.paymentStatus === 'paid' ? (
                  <div className="inline-flex items-center space-x-1 text-green-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-semibold">PAID</span>
                  </div>
                ) : booking.paymentStatus === 'failed' ? (
                  <div className="inline-flex items-center space-x-1 text-red-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-semibold">FAILED</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center space-x-1 text-yellow-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-semibold">PENDING</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Note - Compact */}
          <div className="text-center py-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Keep this ticket visible • Generated {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Action Buttons - Compact */}
        <div className="flex gap-3 px-8 py-5 bg-gray-50 border-t border-gray-100 no-print">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-purple-500/25 hover:shadow-xl transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center space-x-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 hover:shadow-md transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download</span>
          </motion.button>
        </div>
      </motion.div>

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
};

export default ParkingTicket;