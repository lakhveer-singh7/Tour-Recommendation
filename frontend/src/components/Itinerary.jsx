import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const Itinerary = ({ days = 3 }) => {
  const [itinerary, setItinerary] = useState(
    Array.from({ length: days }, () => [])
  );

  const onDragEnd = (result) => {
    if (!result.destination) return;
    // Logic to reorder items between days
    // (Expand with API calls to save changes)
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4">
        {itinerary.map((day, dayIndex) => (
          <Droppable key={dayIndex} droppableId={`day-${dayIndex}`}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-gray-100 p-4 rounded-lg w-64"
              >
                <h3>Day {dayIndex + 1}</h3>
                {day.map((item, itemIndex) => (
                  <Draggable
                    key={item.id}
                    draggableId={item.id}
                    index={itemIndex}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-white p-2 my-2 rounded shadow"
                      >
                        {item.name}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default Itinerary;