import { IArrayDefaultProps } from "../default/array-default";
import { Box, Button, Text } from "@mantine/core";

export function ArrayMantine({
  children,
  title,
  onAdd,
  onRemove,
}: IArrayDefaultProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 32,
      }}
    >
      {title && <Text size="lg">{title}</Text>}

      {children.map((child, index) => (
        <Box key={index}>
          {child}

          <Button
            onClick={() => {
              onRemove(index);
            }}
            color="gray"
            variant="subtle"
            sx={{ marginTop: 16 }}
          >
            Remove
          </Button>
        </Box>
      ))}

      <Button sx={{ justifySelf: "end" }} onClick={onAdd}>
        Add attendee
      </Button>
    </Box>
  );
}
