const fs = require('fs');
let c = fs.readFileSync('src/pages/SeatMapPage.jsx', 'utf8');
c = c.replace(
  'const bookingResult = await createBooking(\n  const seatIds = Object.keys(seatMap)',
`const bookingResult = await createBooking(
        holdResult.holdId,
        showtimeId,
        totalAmount,
      );
      navigate(\`/payment/\${bookingResult.bookingId}\`);
    } catch (err) {
      toast.error(
        err.conflictSeatIds?.length
          ? \`\${err.message} — ghế: \${err.conflictSeatIds.join(', ')}\`
          : err.message
      );
      refreshSeatMap();
    } finally {
      setIsBooking(false);
    }
  }

  const seatIds = Object.keys(seatMap)`
);
fs.writeFileSync('src/pages/SeatMapPage.jsx', c);
