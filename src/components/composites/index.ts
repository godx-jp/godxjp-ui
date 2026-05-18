// @godxjp/ui composites — higher-level components composed from
// primitives. Each composite encodes a multi-step flow + sensible
// defaults, surfaces props for service-specific behaviour, and never
// asks the consumer to write inline visual classNames.

export {
  Upload,
  ImageUpload,
  AvatarUploader,
  MediaUpload,
  MediaUploadSingle,
  MediaUploadMultiple,
  MediaUploadAvatar,
} from "./upload";
export type {
  UploadFile,
  UploadStatus,
  UploadListType,
  UploadRequestParams,
  UploadCustomRequest,
  UploadLabels,
  UploadProps,
  ImageUploadProps,
  AvatarUploaderProps,
  AvatarUploaderLabels,
  AvatarUploadCallbackParams,
  MediaUploadSingleProps,
  MediaUploadMultipleProps,
  MediaUploadAvatarProps,
  MediaUploadSize,
  MediaUploadShape,
} from "./upload";

export { LocaleInput, LocaleRowInput } from "./locale-input";
export type {
  LocaleInputProps,
  LocaleRowInputProps,
  LocaleStatus,
} from "./locale-input";

// Calendar / scheduling screen compositions (Week / Month / Day /
// Agenda / EventDetail / CreateEvent / FindATime).
export * from "./calendar/index";

// Table import / export flow + dialog (canon ⑪). Lives next to the
// `<Table>` primitive but is NOT a Table prop — keeps the primitive
// focused on rows + columns (cardinal rule 32).
export {
  TableImportFlow,
  TableExportDialog,
} from "./table-import-export";
export type {
  TableImportFlowProps,
  TableImportStep,
  TableImportStepperLabels,
  TableImportFileInfo,
  TableImportErrorRow,
  TableExportDialogProps,
  TableExportFormat,
  TableExportRange,
} from "./table-import-export";
