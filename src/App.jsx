import { useState, useMemo, useEffect } from "react";
import {
  Button,
  Input,
  AppShell,
  Center,
  Stack,
  Group,
  Flex,
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
import { notifications } from "@mantine/notifications";
import {
  IconCalendar,
  IconCopy,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconWorldWww,
} from "@tabler/icons-react";
import { saveShortLink } from "./linkService";
import { shake128 } from "js-sha3";

const DEFAULT_EXPIRY_HOURS = 1;
const DEFAULT_EXPIRY_VALUE = String(DEFAULT_EXPIRY_HOURS);
const COOLDOWN_SECONDS = 5;
const BASE_EXPIRY_OPTIONS = [
  { value: DEFAULT_EXPIRY_VALUE, label: `${DEFAULT_EXPIRY_HOURS} Hour` },
  { value: "6", label: "6 Hours" },
  { value: "12", label: "12 Hours" },
  { value: "never", label: "Never" },
];

const getDefaultExpiryDate = () => {
  const d = new Date();
  d.setHours(d.getHours() + DEFAULT_EXPIRY_HOURS);
  return d;
};

const MAIN_BACKGROUND =
  "radial-gradient(900px circle at 50% -20%, rgba(34, 184, 255, 0.12), transparent 55%), var(--mantine-color-dark-8)";
const LOGO_SRC = "/LinkChopLogo.svg";

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

  const [expiryValue, setExpiryValue] = useState(DEFAULT_EXPIRY_VALUE);
  const [expiryDate, setExpiryDate] = useState(getDefaultExpiryDate);

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
    if (!val) return;
    setExpiryValue(val);
    if (val === "custom") {
      setModalOpened(true);
    } else if (val === "never") {
      setExpiryDate(null);
    } else {
      const hours = Number.parseInt(val, 10);
      const d = new Date();
      d.setHours(d.getHours() + hours);
      setExpiryDate(d);
    }
  };

  const selectData = useMemo(() => {
    return [
      ...BASE_EXPIRY_OPTIONS,
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

      setChoppedUrl(`linkchop.me/${shortCode}`);
      setFinalExpiry(expiry);

      notifications.show({
        title: "Chop Successful!",
        message: "Your shortened link is ready.",
        color: "teal",
        icon: <IconCheck size={18} />,
      });

      setUrl("");
      setExpiryValue(DEFAULT_EXPIRY_VALUE);
      setExpiryDate(getDefaultExpiryDate());
      setCooldown(COOLDOWN_SECONDS);
    } catch (error) {
      console.error(error);
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
    <AppShell padding={{ base: "md", sm: "xl" }} footer={{ height: 48 }}>
      <AppShell.Main
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: MAIN_BACKGROUND,
        }}
      >
        <Stack align="center" w="100%" maw={720} gap="xl">
          <img
            src={LOGO_SRC}
            alt="LinkChop"
            style={{ width: "min(260px, 70vw)", height: "auto" }}
            decoding="async"
            loading="eager"
          />
          <Text size="sm" c="dimmed" ta="center" maw={520}>
            Shorten links quickly with smart expirations and one-click copy.
          </Text>

          <Stack gap="xs" w="100%" align="center">
            <Flex
              w="100%"
              gap="sm"
              align="center"
              justify="center"
              direction={{ base: "column", sm: "row" }}
            >
              <Input
                placeholder="URL to Chop"
                size="md"
                w="100%"
                maw={560}
                style={{ flex: 1 }}
                value={url}
                onChange={(e) => setUrl(e.currentTarget.value)}
                leftSection={<IconWorldWww size={18} />}
                leftSectionPointerEvents="none"
                rightSectionPointerEvents="all"
                rightSectionWidth={180}
                rightSection={
                  <Group gap={4} wrap="nowrap" h="100%" w="100%">
                    <Divider
                      orientation="vertical"
                      h="60%"
                      style={{ alignSelf: "center" }}
                    />
                    <Text size="xs" fw={700} c="dimmed">
                      Expires
                    </Text>
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
                      aria-label="Expiration"
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
                w={{ base: "100%", sm: 120 }}
              >
                {cooldown > 0 ? `Wait ${cooldown}s` : "Chop"}
              </Button>
            </Flex>

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
                  w="100%"
                  maw={520}
                  style={styles}
                >
                  <Flex
                    gap="sm"
                    justify={{ base: "flex-start", sm: "space-between" }}
                    align={{ base: "flex-start", sm: "center" }}
                    direction={{ base: "column", sm: "row" }}
                  >
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
                  </Flex>
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
      </AppShell.Main>
      <AppShell.Footer>
        <Center h="100%">
          <Text size="xs" c="dimmed">
            Copyright (c) {new Date().getFullYear()} LinkChop. All rights
            reserved.
          </Text>
        </Center>
      </AppShell.Footer>
    </AppShell>
  );
}

export default App;
