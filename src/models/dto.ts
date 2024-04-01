import { Type } from "class-transformer";
import { IsString, IsIn, ValidateNested } from "class-validator";

export type Language = "ZH" | "JP" | "EN" | "auto" | "mix";

export class MessageContent {
  @IsString()
  requesterId!: string;

  @IsString()
  modelId!: string;

  @IsIn(["ZH", "JP", "EN", "auto", "mix"])
  language!: Language;

  @IsString()
  text!: string;
}

export class SendMessageRequest {
  @IsString()
  queue!: string;

  @ValidateNested()
  @Type(() => MessageContent)
  message!: MessageContent;
}
