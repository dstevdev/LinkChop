import { useState, useMemo, useEffect } from "react";
import {
  Button,
  Input,
  AppShell,
  Title,
  Center,
  Stack,
  Group,
  Modal,
  Select,
  Divider,
  Paper,
  Text,
  CopyButton,
  ActionIcon,
  Tooltip,
  Transition,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications"; // Added notifications
import {
  IconCalendar,
  IconCopy,
  IconCheck,
  IconX,
  IconAlertCircle,
} from "@tabler/icons-react"; // Added icons for feedback
import { saveShortLink } from "./linkService";
import { shake128 } from "js-sha3";

function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [choppedUrl, setChoppedUrl] = useState(null);
  const [finalExpiry, setFinalExpiry] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const [expiryValue, setExpiryValue] = useState("1");
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return d;
  });

  const validateUrl = (string) => {
    try {
      const parsed = new URL(string);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch (_) {
      return false;
    }
  };

  const ensureDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDateTime12h = (date) => {
    const d = ensureDate(date);
    if (!d) return null;
    return `${d.toLocaleDateString([], {
      month: "2-digit",
      day: "2-digit",
    })} ${d
      .toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toUpperCase()}`;
  };

  const handleSelectChange = (val) => {
    setExpiryValue(val);
    if (val === "custom") {
      setModalOpened(true);
    } else if (val === "never") {
      setExpiryDate(null);
    } else {
      const hours = parseInt(val);
      const d = new Date();
      d.setHours(d.getHours() + hours);
      setExpiryDate(d);
    }
  };

  const selectData = useMemo(() => {
    const baseOptions = [
      { value: "1", label: "1 Hour" },
      { value: "6", label: "6 Hours" },
      { value: "12", label: "12 Hours" },
      { value: "never", label: "Never" },
    ];
    return [
      ...baseOptions,
      {
        value: "custom",
        label:
          expiryValue === "custom"
            ? formatDateTime12h(expiryDate) || "Custom"
            : "Custom",
      },
    ];
  }, [expiryValue, expiryDate]);

  const handleEncodeUrl = async (url, expiry) => {
    // 1. URL Validation Notification
    if (!validateUrl(url)) {
      notifications.show({
        title: "Invalid URL",
        message: "Please include http:// or https://",
        color: "red",
        icon: <IconX size={18} />,
      });
      return;
    }

    setLoading(true);
    try {
      const timestampz = expiry ? expiry.toISOString() : null;
      const shortCode = shake128(url, 24);

      const { error } = await saveShortLink(url, shortCode, timestampz);

      if (error) {
        // 2. Rate Limit Notification
        if (error.message.includes("Rate limit exceeded")) {
          notifications.show({
            title: "Slow Down!",
            message: "You're chopping too fast. Please wait a minute.",
            color: "orange",
            icon: <IconAlertCircle size={18} />,
          });
        } else {
          throw error;
        }
        return;
      }

      // Success logic
      setChoppedUrl(`linkchop.me/${shortCode}`);
      setFinalExpiry(expiry);

      notifications.show({
        title: "Chop Successful!",
        message: "Your shortened link is ready.",
        color: "teal",
        icon: <IconCheck size={18} />,
      });

      setUrl("");
      setExpiryValue("1");
      const d = new Date();
      d.setHours(d.getHours() + 1);
      setExpiryDate(d);
      setCooldown(5);
    } catch (error) {
      console.error(error);
      // 3. Generic Error Notification
      notifications.show({
        title: "Upload Failed",
        message: "We couldn't save your link. Try again later.",
        color: "red",
        icon: <IconX size={18} />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell padding="md">
      <AppShell.Main>
        <Center h="80vh">
          <Stack align="center" w="100%" gap="xl">
            <Title
              order={1}
              size="3rem"
              fw={900}
              variant="gradient"
              gradient={{ from: "blue", to: "cyan" }}
            >
              LinkChop
            </Title>

            <Stack gap="xs" w="100%" align="center">
              <Group align="center" gap="xs">
                <Input
                  placeholder="URL to Chop"
                  size="md"
                  w={550}
                  value={url}
                  onChange={(e) => setUrl(e.currentTarget.value)}
                  rightSectionPointerEvents="all"
                  rightSectionWidth={160}
                  rightSection={
                    <Group gap={0} wrap="nowrap" h="100%" w="100%">
                      <Divider
                        orientation="vertical"
                        h="60%"
                        style={{ alignSelf: "center" }}
                      />
                      <Select
                        key={ensureDate(expiryDate)?.getTime() || "never"}
                        variant="unstyled"
                        size="md"
                        value={expiryValue}
                        onChange={handleSelectChange}
                        onOptionSubmit={(val) =>
                          val === "custom" && setModalOpened(true)
                        }
                        data={selectData}
                        allowDeselect={false}
                        rightSection={null}
                        renderOption={({ option }) =>
                          option.value === "custom" ? "Custom" : option.label
                        }
                        styles={{
                          input: {
                            textAlign: "center",
                            padding: 0,
                            fontWeight: 600,
                            cursor: "pointer",
                            color: "var(--mantine-color-blue-filled)",
                            fontSize: "12px",
                          },
                        }}
                      />
                    </Group>
                  }
                />
                <Button
                  size="md"
                  loading={loading}
                  disabled={cooldown > 0}
                  onClick={() => handleEncodeUrl(url, expiryDate)}
                  px="xl"
                  w={120}
                >
                  {cooldown > 0 ? `Wait ${cooldown}s` : "Chop"}
                </Button>
              </Group>

              <Transition
                mounted={!!choppedUrl}
                transition="fade"
                duration={400}
                timingFunction="ease"
              >
                {(styles) => (
                  <Paper
                    withBorder
                    p="md"
                    radius="md"
                    shadow="sm"
                    w="35%"
                    style={styles}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Stack gap={4}>
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                          Your chopped URL is
                        </Text>
                        <Text
                          fw={600}
                          size="lg"
                          c="blue.7"
                          style={{ lineHeight: 1.2 }}
                        >
                          {choppedUrl}
                        </Text>
                        <Text size="xs" c="gray.6" fw={500}>
                          {finalExpiry
                            ? `Expires: ${formatDateTime12h(finalExpiry)}`
                            : "Link is permanent (Never expires)"}
                        </Text>
                      </Stack>

                      <CopyButton value={choppedUrl} timeout={2000}>
                        {({ copied, copy }) => (
                          <Tooltip
                            label={copied ? "Copied" : "Copy"}
                            withArrow
                            position="right"
                          >
                            <ActionIcon
                              color={copied ? "teal" : "blue"}
                              variant="light"
                              onClick={copy}
                              size="lg"
                            >
                              {copied ? (
                                <IconCheck size={20} />
                              ) : (
                                <IconCopy size={20} />
                              )}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                    </Group>
                  </Paper>
                )}
              </Transition>
            </Stack>

            <Modal
              opened={modalOpened}
              onClose={() => setModalOpened(false)}
              title="Custom Expiration"
              centered
            >
              <Stack>
                <DateTimePicker
                  label="Pick date and time"
                  placeholder="Select..."
                  value={ensureDate(expiryDate)}
                  onChange={setExpiryDate}
                  leftSection={<IconCalendar size={16} />}
                  valueFormat="MM/DD/YY hh:mm A"
                  withSeconds={false}
                  timePickerProps={{
                    format: "12h",
                    withDropdown: true,
                    popoverProps: { withinPortal: false },
                  }}
                />
                <Button fullWidth onClick={() => setModalOpened(false)}>
                  Confirm
                </Button>
              </Stack>
            </Modal>
          </Stack>
        </Center>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
