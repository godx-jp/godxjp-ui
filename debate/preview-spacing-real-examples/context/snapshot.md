# Current preview structure (verify in repo)

## Component groups available (ONLY these may be used in examples — no hand-rolling):

PageContainer, Stack, Inline, Flex, ResponsiveGrid, AppShell, Sidebar, Topbar, PageInset, SplitPane, Breadcrumb, Button, DataTable, Card, CardContent, StatCard, Badge, Descriptions, EmptyState, Progress, Timeline, Table, DataState, InfiniteQueryState, MutationFeedback, FormField, Input, SearchInput, Select, Switch, Textarea, Label, Checkbox, RadioGroup, DatePicker, Dialog, AlertDialog, Sheet, Alert, SkeletonTable, SkeletonCard, Toaster, Tabs, FilterBar, FilterGroup, Pagination, DropdownMenu, Steps, AppProvider, formatDate, TimePicker, DateRangePicker, Cascader, TreeSelect, Transfer, Upload, UploadCropDialog, ColorPicker, Slider, Calendar, CountrySelect, ChoiceField, Command, CheckboxGroup, Radio, SearchSelect, Autocomplete, Popover, ScrollArea, Collapsible, TreeList, PageHeader, LocalePicker, TimezonePicker, DateFormatPicker, TimeFormatPicker, Tooltip, PrefetchLink, QueryRefetchButton, Avatar, Separator, Skeleton, Toggle, ToggleGroup, AspectRatio, Accordion, HoverCard, PasswordInput, PasswordStrength, Drawer, InputOTP, Rating, TagInput, ContextMenu, Menubar, NavigationMenu, ResizablePanel, Carousel, Combobox, TimeInput

## examples/ files:

layout/Inline.preview.tsx layout/Sidebar.preview.tsx layout/AppShell.preview.tsx layout/PageContainer.preview.tsx layout/Stack.preview.tsx screens/AgentPortal.preview.tsx data-display/Card.preview.tsx

## preview app: preview/index.html (overview) + isolate.html/frame.html; vite on :6008; deployed to Pages.

## The user's complaints: (1) overview spacing between components is RAW/cramped or just line-breaks (should use layout primitives Stack/Inline/ResponsiveGrid/Flex gap); (2) examples are too sparse/superficial — want realistic, true-to-life examples (real images, real-looking data) so users can imagine usage.
