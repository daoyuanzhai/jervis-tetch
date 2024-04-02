import { Type } from "class-transformer";
import {
  IsOptional,
  IsNotEmpty,
  IsString,
  IsIn,
  ValidateNested,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from "class-validator";

export type Language = "ZH" | "JP" | "EN" | "auto" | "mix";

export type MessageType = "audio_only" | "audio_and_video";

export class ModelDetail {
  @IsString()
  modelId!: string;
  @IsOptional()
  @IsString()
  modelResultId?: string;
  @IsOptional()
  @IsString()
  modelResultPath?: string;
}

export class MessageContent {
  @IsIn(["audio_and_video", "audio_only"])
  type!: MessageType;

  @IsString()
  requesterId!: string;

  @ValidateNested()
  @Type(() => ModelDetail)
  @IsNotEmpty({ message: "audioModel is required" })
  audioModel!: ModelDetail;

  @IsVideoModelRequiredBasedOnType({
    message: "videoModel field conditionally required based on type",
  })
  @ValidateNested()
  @Type(() => ModelDetail)
  videoModel?: ModelDetail;

  @IsIn(["ZH", "JP", "EN", "auto", "mix"])
  language!: Language;

  @IsOptional()
  @IsString()
  text?: string;
}

export type QueueName =
  | "trainer-request-queue"
  | "trainer-response-queue"
  | "inferer-request-queue"
  | "inferer-response-queue";

export class SendMessageRequest {
  @IsIn([
    "trainer-request-queue",
    "trainer-response-queue",
    "inferer-request-queue",
    "inferer-response-queue",
  ])
  queue!: QueueName;

  @ValidateNested()
  @Type(() => MessageContent)
  @IsNotEmpty()
  message!: MessageContent;
}

function IsVideoModelRequiredBasedOnType(
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "IsVideoModelRequiredBasedOnType",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const relatedValue = (args.object as any).type;
          if (["audio_and_video"].includes(relatedValue)) {
            return typeof value === "object"; // videoModel is required
          } else if (["audio_only"].includes(relatedValue)) {
            return (
              value === undefined || value === null || value.trim().length === 0
            ); // videoModel should not exist or be empty
          }
          return true; // Default case, should not hit
        },
      },
    });
  };
}
