// ListComponent.jsx
import React from 'react';
import { List } from '@material-tailwind/react';
import { Card } from '@mui/material';
import { ListWithIcon } from './ListWithIcon';

export function ListComponent({ flags, onClick, onDelete, onEdit }) {
  return (
    <Card
      className="w-96"
      sx={{
        height: '300px', 
        overflowY: 'auto', 
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#888',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: '#555',
        },
      }}
    >
      <List>
        {flags.map((flag, index) => (
          <ListWithIcon
            key={index}
            label={flag.label}
            timestamp={flag.timestamp}
            index={index}
            onClick={onClick}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </List>
    </Card>
  );
}
