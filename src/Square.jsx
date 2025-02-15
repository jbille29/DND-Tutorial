// components/Square.jsx
import React from 'react';
import { useDrop } from 'react-dnd';
import Tile from './Tile';

const Square = ({ onDrop, returnTile, tile, id, feature, letterScores }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'tile',
    drop: (item) => onDrop(item, id),
    canDrop: () => !tile, // Only allow dropping if there's no tile or the tile is not pre-placed
    collect: monitor => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  const featureStyle = feature ? { border: '2px dashed red' } : {}; // Example style change for feature squares

  const handleDoubleClick = () => {
    returnTile(id);
  };

  let backgroundColor = '#f0f0f0'; // Default background
  if (isOver && canDrop) {
    backgroundColor = '#aaf'; // Active drag over and can drop
  } else if (isOver && !canDrop) {
    backgroundColor = '#f88'; // Active drag over and cannot drop
  } else if (canDrop) {
    backgroundColor = '#faa'; // Potential drop zone (only theoretical since it won't happen without isOver)
  }

  return (
    <div ref={drop} 
    style={{ 
      width: '60px', 
      height: '60px', 
      backgroundColor, 
      border: '1px solid #b0bec5', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}
         onDoubleClick={handleDoubleClick}>
          {tile && <Tile key={tile.id} letter={tile.letter} id={tile.id} isDraggable={!tile.isPrePlaced} letterScores={letterScores}/>}
    </div>
  );
};

export default Square;
