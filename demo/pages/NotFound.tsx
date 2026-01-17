import { Anchor, Center, Stack, Text, Title } from "@mantine/core";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("Bad route", location.pathname);
  }, [location.pathname]);

  return (
    <Center h="100vh" className="jsonjoy">
      <Stack align="center" spacing="xs">
        <Title order={1}>404</Title>
        <Text c="dimmed">Oops! Page not found</Text>
        <Anchor href="/">Return to Home</Anchor>
      </Stack>
    </Center>
  );
};

export default NotFound;
