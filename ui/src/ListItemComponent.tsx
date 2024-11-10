import React from 'react';
import { ListItem, Box, Typography } from '@mui/material';

const ListItemComponent = ({ itemNumber, paddedNumber, onClick }) => (
  <ListItem button onClick={onClick} sx={{ maxWidth: '100%', display: 'flex', alignItems: 'center' }}>
    <Box display="flex" justifyContent="space-between" width="100%">
      <Typography variant="body1" color="white" noWrap>
        {itemNumber}
      </Typography>
      <Typography variant="body1" color="white" noWrap>
        {paddedNumber}
      </Typography>
    </Box>
  </ListItem>
);

export default ListItemComponent;