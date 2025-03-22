import { Modal } from 'antd';
import { useMemo } from 'react';
import { FaChair, FaChalkboardTeacher } from 'react-icons/fa';

const RoomSeatsModal = ({ room, open, onClose, theme = 'classroom' }) => {
  // Theme variables
  const themeVars = {
    backgroundColor: '#f5f5f5',
    blackboardColor: '#2E7D32',
    blackboardBorderColor: '#5D4037',
    deskColor: '#BBDEFB',
    deskBorderColor: '#90CAF9',
    teacherDeskColor: '#8D6E63',
    legendBackgroundColor: '#E0E0E0',
    
    deskWidth: 50,
    deskHeight: 30,
    chairSize: 22,
    seatCodeSize: 14,
    rowLabelSize: 24,
    seatSpacing: 16,
    rowSpacing: 20,
    
    availableColor: '#4CAF50',
    occupiedColor: '#F44336',
  };

  // Consolidated styles object
  const styles = {
    modalBody: {
      background: themeVars.backgroundColor, 
      padding: '24px'
    },
    blackboardContainer: { 
      textAlign: 'center', 
      marginBottom: 24 
    },
    blackboard: {
      height: '60px',
      background: `linear-gradient(to bottom, ${themeVars.blackboardColor}, ${themeVars.blackboardColor})`,
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      border: `8px solid ${themeVars.blackboardBorderColor}`,
      position: 'relative'
    },
    blackboardText: { 
      marginLeft: 8, 
      color: '#fff', 
      fontWeight: 'bold' 
    },
    blackboardShelf: {
      position: 'absolute',
      bottom: '-15px',
      height: '10px',
      width: '100px',
      background: themeVars.blackboardBorderColor,
      borderRadius: '2px'
    },
    teacherDesk: {
      width: '120px',
      height: '40px',
      background: themeVars.teacherDeskColor,
      margin: '20px auto 30px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: '12px',
      fontWeight: 'bold',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    },
    noSeatsMessage: { 
      textAlign: 'center' 
    },
    seatingContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: `${themeVars.rowSpacing}px`,
    },
    row: {
      display: 'flex',
      justifyContent: 'center',
    },
    rowLabel: {
      width: `${themeVars.rowLabelSize}px`,
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    seatContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '4px',
      width: `${themeVars.deskWidth + 10}px`,
      marginRight: `${themeVars.seatSpacing}px`,
    },
    emptySeatContainer: {
      width: `${(themeVars.deskWidth + 10) / 2}px`,
      marginRight: `${themeVars.seatSpacing / 2}px`,
    },
    desk: {
      width: `${themeVars.deskWidth}px`,
      height: `${themeVars.deskHeight}px`,
      background: themeVars.deskColor,
      borderRadius: '3px 3px 0 0',
      border: `1px solid ${themeVars.deskBorderColor}`,
      marginBottom: '2px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    },
    seatCode: {
      fontSize: `${themeVars.seatCodeSize}px`,
      fontWeight: 'bold',
      color: '#444'
    },
    chairContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    chair: {
      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
    },
    legend: {
      display: 'flex',
      justifyContent: 'center',
      gap: '16px',
      marginTop: '20px',
      padding: '10px',
      background: themeVars.legendBackgroundColor,
      borderRadius: '4px'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    legendText: {
      fontSize: '12px'
    }
  };

  // Fix seats: if a seat is missing row/column, compute from seat_code.
  const fixedSeats = useMemo(() => {
    if (!room || !room.seats || room.seats.length === 0) return [];
    return room.seats.map((seat) => {
      if (!seat.row && seat.seat_code) {
        return {
          ...seat,
          row: seat.seat_code[0],
          column: parseInt(seat.seat_code.slice(1), 10),
        };
      }
      return seat;
    });
  }, [room]);

  // Generate a complete alphabet array for columns (A-Z)
  const completeAlphabet = useMemo(() => {
    return Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  }, []);

  // Find the actual columns that exist in the data
  const existingColumns = useMemo(() => {
    if (fixedSeats.length === 0) return [];
    return Array.from(new Set(fixedSeats.map((seat) => seat.row))).sort();
  }, [fixedSeats]);

  // Determine the range of columns to display based on min/max in data
  const columnsRange = useMemo(() => {
    if (existingColumns.length === 0) return [];
    
    // Find the first and last column in the alphabet
    const minColChar = existingColumns[0];
    const maxColChar = existingColumns[existingColumns.length - 1];
    
    // Get their indices in the alphabet
    const minColIndex = minColChar.charCodeAt(0) - 65; // 'A' is 65
    const maxColIndex = maxColChar.charCodeAt(0) - 65;
    
    // Return the complete range including any gaps
    return completeAlphabet.slice(minColIndex, maxColIndex + 1);
  }, [existingColumns, completeAlphabet]);

  // Compute the rows based on the maximum seat number (numeric part).
  const rowsNumbers = useMemo(() => {
    if (fixedSeats.length === 0) return [];
    const numbers = fixedSeats.map((seat) => seat.column);
    const maxRow = Math.max(...numbers);
    return Array.from({ length: maxRow }, (_, i) => i + 1);
  }, [fixedSeats]);

  // Helper to determine chair color based on seat status - simplified to just Available or Occupied
  const getSeatColor = (status) => {
    return status === 'Available' ? themeVars.availableColor : themeVars.occupiedColor;
  };

  return (
    <Modal
      title={`Classroom ${room ? room.room_code : ''}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width="auto"
      centered
    >
      {/* Blackboard at the front */}
      <div style={styles.blackboardContainer}>
        <div style={styles.blackboard}>
          <FaChalkboardTeacher size={28} color="#fff" />
          <span style={styles.blackboardText}>BLACKBOARD</span>
          <div style={styles.blackboardShelf}></div>
        </div>
        
        {/* Teacher's desk */}
        <div style={styles.teacherDesk}>
          Teacher's Desk
        </div>
      </div>

      {rowsNumbers.length === 0 || columnsRange.length === 0 ? (
        <div style={styles.noSeatsMessage}>No seats available.</div>
      ) : (
        <div style={styles.seatingContainer}>
          {/* Render each row */}
          {rowsNumbers.map((rowNum) => (
            <div key={rowNum} style={styles.row}>
              
              {/* Seats in this row */}
              {columnsRange.map((letter, index) => {
                // Find the seat if it exists
                const seat = fixedSeats.find(
                  (seat) => seat.row === letter && seat.column === rowNum
                );
                
                // Check if this letter exists in our data
                const letterExists = existingColumns.includes(letter);
                
                // Add margin-right to all elements except the last one
                const isLastInRow = index === columnsRange.length - 1;

                // If the letter exists in our data, render a full seat container, otherwise render a half-width placeholder
                return letterExists ? (
                  <div
                    key={`${rowNum}-${letter}`}
                    style={{
                      ...styles.seatContainer,
                      marginRight: isLastInRow ? 0 : styles.seatContainer.marginRight
                    }}
                  >
                    {seat ? (
                      <>
                        {/* Desk with seat number on top */}
                        <div style={styles.desk}>
                          <div style={styles.seatCode}>
                            {seat.seat_code}
                          </div>
                        </div>
                        
                        {/* Chair */}
                        <div style={styles.chairContainer}>
                          <FaChair 
                            size={themeVars.chairSize} 
                            color={getSeatColor(seat.status)} 
                            style={styles.chair}
                          />
                        </div>
                      </>
                    ) : (
                      // Empty space but with full width as the letter exists in the data
                      <div style={{ width: styles.seatContainer.width }}></div>
                    )}
                  </div>
                ) : (
                  // Half-width placeholder for missing columns
                  <div
                    key={`${rowNum}-${letter}`}
                    style={{
                      ...styles.emptySeatContainer,
                      marginRight: isLastInRow ? 0 : styles.emptySeatContainer.marginRight
                    }}
                  >
                  </div>
                );
              })}
            </div>
          ))}
          
          {/* Legend - only Available and Occupied */}
          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <FaChair size={16} color={themeVars.availableColor} />
              <span style={styles.legendText}>Available</span>
            </div>
            <div style={styles.legendItem}>
              <FaChair size={16} color={themeVars.occupiedColor} />
              <span style={styles.legendText}>Occupied</span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default RoomSeatsModal;