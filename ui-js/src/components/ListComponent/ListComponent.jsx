import {
    List,
    Card,
  } from "@material-tailwind/react";
  import { ListWithIcon } from "./ListWithIcon";
   
   
  export function ListComponent({ flags, onClick }) {
    return (
      <Card className="w-96">
        <List>
          {flags.map((flag, index) => (
            <ListWithIcon
              label={flag.label}
              key={index}
              index={index}
              timestamp={flag.timestamp}
              onClick={onClick}
            />
          ))}
        </List>
      </Card>
    );
  }