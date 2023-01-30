import { IObjectDefaultProps } from "../default/object-default";
import { Box, Text } from "@mantine/core";

export function ObjectMantine({ children, title }: IObjectDefaultProps) {
  return (
    <Box>
      {title && (
        <Text weight="bold" size="lg" sx={{ marginBottom: 16 }}>
          {title}
        </Text>
      )}

      {children}
    </Box>
  );
}

export function ObjectMantineRows(props: IObjectDefaultProps) {
  return (
    <ObjectMantine {...props}>
      <Box sx={{ display: "flex", gap: 8, "& > *": { flex: 1 } }}>
        {props.children}
      </Box>
    </ObjectMantine>
  );
}
