import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ParkingTicket = ({ booking, onClose }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
      subject: 'ParkHub Parking Ticket',
      creator: 'ParkHub',
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 no-print">
          <h2 className="text-2xl font-bold text-gray-800">Parking Ticket</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Ticket Content */}
        <div id="parking-ticket" className="p-6">
          {/* Ticket Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200 mb-4">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-blue-700 font-medium">PARKING TICKET</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ParkHub</h1>
            <p className="text-gray-600">Official Parking Receipt</p>
          </div>

          {/* Ticket Number */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg">
              <div className="text-sm font-medium opacity-90">Ticket Number</div>
              <div className="text-xl font-bold">{ticketNumber}</div>
            </div>
          </div>

          {/* Main Ticket Information */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Parking Location</label>
                  <div className="text-lg font-semibold text-gray-900">
                    {booking.parkingSpot?.name || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {booking.parkingSpot?.address?.fullAddress || 'Address not available'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {booking.parkingSpot?.address?.city || 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Vehicle Details</label>
                  <div className="text-lg font-semibold text-gray-900">
                    {booking.vehicleNumber || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {booking.vehicleType ? String(booking.vehicleType).replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Customer</label>
                  <div className="text-lg font-semibold text-gray-900">
                    {booking.customerName || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {booking.customerPhone || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Start Date & Time</label>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDate(booking.startTime)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatTime(booking.startTime)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">End Date & Time</label>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDate(endTime)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatTime(endTime)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Duration</label>
                  <div className="text-lg font-semibold text-gray-900">
                    {booking.durationHours} hour{booking.durationHours !== 1 ? 's' : ''}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Total Amount</label>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{booking.amount}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Status Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-600">Payment Method</label>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                  booking.paymentMethod === 'STRIPE' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {booking.paymentMethod}
                </span>
                <span className={`text-sm font-semibold ${
                  booking.paymentStatus === 'paid' 
                    ? 'text-green-700' 
                    : booking.paymentStatus === 'failed' 
                    ? 'text-red-700' 
                    : 'text-yellow-700'
                }`}>
                  • {booking.paymentStatus}
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-600">Booking Status</label>
              <div className="mt-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full ${
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                  booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full animate-pulse ${
                    booking.status === 'pending' ? 'bg-yellow-500' :
                    booking.status === 'confirmed' ? 'bg-blue-500' :
                    booking.status === 'completed' ? 'bg-green-500' :
                    'bg-red-500'
                  }`}></span>
                  {(booking.status || 'pending').replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          

          {/* Footer */}
          <div className="border-t border-gray-200 pt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Please keep this ticket visible in your vehicle during your stay
            </p>
            <p className="text-xs text-gray-500">
              Generated on {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 p-6 bg-gray-50 border-t border-gray-200 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print Ticket</span>
          </button>
          
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParkingTicket;