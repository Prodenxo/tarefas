-- CreateTable
CREATE TABLE `Instance` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `connectionStatus` ENUM('open', 'close', 'connecting') NOT NULL DEFAULT 'open',
    `ownerJid` VARCHAR(100) NULL,
    `profileName` VARCHAR(100) NULL,
    `profilePicUrl` VARCHAR(500) NULL,
    `integration` VARCHAR(100) NULL,
    `number` VARCHAR(100) NULL,
    `businessId` VARCHAR(100) NULL,
    `token` VARCHAR(255) NULL,
    `clientName` VARCHAR(100) NULL,
    `disconnectionReasonCode` INTEGER NULL,
    `disconnectionObject` JSON NULL,
    `disconnectionAt` TIMESTAMP NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NULL,

    UNIQUE INDEX `Instance_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `creds` TEXT NULL,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `Session_sessionId_key`(`sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chat` (
    `id` VARCHAR(191) NOT NULL,
    `remoteJid` VARCHAR(100) NOT NULL,
    `name` VARCHAR(100) NULL,
    `labels` JSON NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NULL,
    `instanceId` VARCHAR(191) NOT NULL,
    `unreadMessages` INTEGER NOT NULL DEFAULT 0,

    INDEX `Chat_instanceId_idx`(`instanceId`),
    INDEX `Chat_remoteJid_idx`(`remoteJid`),
    UNIQUE INDEX `Chat_instanceId_remoteJid_key`(`instanceId`, `remoteJid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contact` (
    `id` VARCHAR(191) NOT NULL,
    `remoteJid` VARCHAR(100) NOT NULL,
    `pushName` VARCHAR(100) NULL,
    `profilePicUrl` VARCHAR(500) NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    INDEX `Contact_remoteJid_idx`(`remoteJid`),
    INDEX `Contact_instanceId_idx`(`instanceId`),
    UNIQUE INDEX `Contact_remoteJid_instanceId_key`(`remoteJid`, `instanceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` VARCHAR(191) NOT NULL,
    `key` JSON NOT NULL,
    `pushName` VARCHAR(100) NULL,
    `participant` VARCHAR(100) NULL,
    `messageType` VARCHAR(100) NOT NULL,
    `message` JSON NOT NULL,
    `contextInfo` JSON NULL,
    `source` ENUM('ios', 'android', 'web', 'unknown', 'desktop') NOT NULL,
    `messageTimestamp` INTEGER NOT NULL,
    `chatwootMessageId` INTEGER NULL,
    `chatwootInboxId` INTEGER NULL,
    `chatwootConversationId` INTEGER NULL,
    `chatwootContactInboxSourceId` VARCHAR(100) NULL,
    `chatwootIsRead` BOOLEAN NULL DEFAULT false,
    `instanceId` VARCHAR(191) NOT NULL,
    `typebotSessionId` VARCHAR(191) NULL,
    `webhookUrl` VARCHAR(500) NULL,
    `status` VARCHAR(30) NULL,
    `sessionId` VARCHAR(191) NULL,

    INDEX `Message_instanceId_idx`(`instanceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MessageUpdate` (
    `id` VARCHAR(191) NOT NULL,
    `keyId` VARCHAR(100) NOT NULL,
    `remoteJid` VARCHAR(100) NOT NULL,
    `fromMe` BOOLEAN NOT NULL,
    `participant` VARCHAR(100) NULL,
    `pollUpdates` JSON NULL,
    `status` VARCHAR(30) NOT NULL,
    `messageId` VARCHAR(191) NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    INDEX `MessageUpdate_instanceId_idx`(`instanceId`),
    INDEX `MessageUpdate_messageId_idx`(`messageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Webhook` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `headers` JSON NULL,
    `enabled` BOOLEAN NULL DEFAULT true,
    `events` JSON NULL,
    `webhookByEvents` BOOLEAN NULL DEFAULT false,
    `webhookBase64` BOOLEAN NULL DEFAULT false,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Webhook_instanceId_key`(`instanceId`),
    INDEX `Webhook_instanceId_idx`(`instanceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chatwoot` (
    `id` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NULL DEFAULT true,
    `accountId` VARCHAR(100) NULL,
    `token` VARCHAR(100) NULL,
    `url` VARCHAR(500) NULL,
    `nameInbox` VARCHAR(100) NULL,
    `signMsg` BOOLEAN NULL DEFAULT false,
    `signDelimiter` VARCHAR(100) NULL,
    `number` VARCHAR(100) NULL,
    `reopenConversation` BOOLEAN NULL DEFAULT false,
    `conversationPending` BOOLEAN NULL DEFAULT false,
    `mergeBrazilContacts` BOOLEAN NULL DEFAULT false,
    `importContacts` BOOLEAN NULL DEFAULT false,
    `importMessages` BOOLEAN NULL DEFAULT false,
    `daysLimitImportMessages` INTEGER NULL,
    `organization` VARCHAR(100) NULL,
    `logo` VARCHAR(500) NULL,
    `ignoreJids` JSON NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Chatwoot_instanceId_key`(`instanceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Label` (
    `id` VARCHAR(191) NOT NULL,
    `labelId` VARCHAR(100) NULL,
    `name` VARCHAR(100) NOT NULL,
    `color` VARCHAR(100) NOT NULL,
    `predefinedId` VARCHAR(100) NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Proxy` (
    `id` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT false,
    `host` VARCHAR(100) NOT NULL,
    `port` VARCHAR(100) NOT NULL,
    `protocol` VARCHAR(100) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Proxy_instanceId_key`(`instanceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Setting` (
    `id` VARCHAR(191) NOT NULL,
    `rejectCall` BOOLEAN NOT NULL DEFAULT false,
    `msgCall` VARCHAR(100) NULL,
    `groupsIgnore` BOOLEAN NOT NULL DEFAULT false,
    `alwaysOnline` BOOLEAN NOT NULL DEFAULT false,
    `readMessages` BOOLEAN NOT NULL DEFAULT false,
    `readStatus` BOOLEAN NOT NULL DEFAULT false,
    `syncFullHistory` BOOLEAN NOT NULL DEFAULT false,
    `wavoipToken` VARCHAR(100) NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Setting_instanceId_key`(`instanceId`),
    INDEX `Setting_instanceId_idx`(`instanceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rabbitmq` (
    `id` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT false,
    `events` JSON NOT NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Rabbitmq_instanceId_key`(`instanceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Nats` (
    `id` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT false,
    `events` JSON NOT NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Nats_instanceId_key`(`instanceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sqs` (
    `id` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT false,
    `events` JSON NOT NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Sqs_instanceId_key`(`instanceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kafka` (
    `id` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT false,
    `events` JSON NOT NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Kafka_instanceId_key`(`instanceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Websocket` (
    `id` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT false,
    `events` JSON NOT NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Websocket_instanceId_key`(`instanceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pusher` (
    `id` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT false,
    `appId` VARCHAR(100) NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    `secret` VARCHAR(100) NOT NULL,
    `cluster` VARCHAR(100) NOT NULL,
    `useTLS` BOOLEAN NOT NULL DEFAULT false,
    `events` JSON NOT NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Pusher_instanceId_key`(`instanceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Typebot` (
    `id` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `description` VARCHAR(255) NULL,
    `url` VARCHAR(500) NOT NULL,
    `typebot` VARCHAR(100) NOT NULL,
    `expire` INTEGER NULL DEFAULT 0,
    `keywordFinish` VARCHAR(100) NULL,
    `delayMessage` INTEGER NULL,
    `unknownMessage` VARCHAR(100) NULL,
    `listeningFromMe` BOOLEAN NULL DEFAULT false,
    `stopBotFromMe` BOOLEAN NULL DEFAULT false,
    `keepOpen` BOOLEAN NULL DEFAULT false,
    `debounceTime` INTEGER NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NULL,
    `ignoreJids` JSON NULL,
    `triggerType` ENUM('all', 'keyword', 'none', 'advanced') NULL,
    `triggerOperator` ENUM('contains', 'equals', 'startsWith', 'endsWith', 'regex') NULL,
    `triggerValue` VARCHAR(191) NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TypebotSetting` (
    `id` VARCHAR(191) NOT NULL,
    `expire` INTEGER NULL DEFAULT 0,
    `keywordFinish` VARCHAR(100) NULL,
    `delayMessage` INTEGER NULL,
    `unknownMessage` VARCHAR(100) NULL,
    `listeningFromMe` BOOLEAN NULL DEFAULT false,
    `stopBotFromMe` BOOLEAN NULL DEFAULT false,
    `keepOpen` BOOLEAN NULL DEFAULT false,
    `debounceTime` INTEGER NULL,
    `typebotIdFallback` VARCHAR(100) NULL,
    `ignoreJids` JSON NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `TypebotSetting_instanceId_key`(`instanceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IntegrationSession` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(255) NOT NULL,
    `remoteJid` VARCHAR(100) NOT NULL,
    `pushName` VARCHAR(191) NULL,
    `status` ENUM('opened', 'closed', 'paused') NOT NULL,
    `awaitUser` BOOLEAN NOT NULL DEFAULT false,
    `context` JSON NULL,
    `type` VARCHAR(100) NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,
    `parameters` JSON NULL,
    `botId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Media` (
    `id` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(500) NOT NULL,
    `type` VARCHAR(100) NOT NULL,
    `mimetype` VARCHAR(100) NOT NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `messageId` VARCHAR(191) NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Media_messageId_key`(`messageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpenaiCreds` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NULL,
    `apiKey` VARCHAR(255) NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `OpenaiCreds_name_key`(`name`),
    UNIQUE INDEX `OpenaiCreds_apiKey_key`(`apiKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpenaiBot` (
    `id` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `description` VARCHAR(255) NULL,
    `botType` ENUM('assistant', 'chatCompletion') NOT NULL,
    `assistantId` VARCHAR(255) NULL,
    `functionUrl` VARCHAR(500) NULL,
    `model` VARCHAR(100) NULL,
    `systemMessages` JSON NULL,
    `assistantMessages` JSON NULL,
    `userMessages` JSON NULL,
    `maxTokens` INTEGER NULL,
    `expire` INTEGER NULL DEFAULT 0,
    `keywordFinish` VARCHAR(100) NULL,
    `delayMessage` INTEGER NULL,
    `unknownMessage` VARCHAR(100) NULL,
    `listeningFromMe` BOOLEAN NULL DEFAULT false,
    `stopBotFromMe` BOOLEAN NULL DEFAULT false,
    `keepOpen` BOOLEAN NULL DEFAULT false,
    `debounceTime` INTEGER NULL,
    `ignoreJids` JSON NULL,
    `splitMessages` BOOLEAN NULL DEFAULT false,
    `timePerChar` INTEGER NULL DEFAULT 50,
    `triggerType` ENUM('all', 'keyword', 'none', 'advanced') NULL,
    `triggerOperator` ENUM('contains', 'equals', 'startsWith', 'endsWith', 'regex') NULL,
    `triggerValue` VARCHAR(191) NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `openaiCredsId` VARCHAR(191) NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpenaiSetting` (
    `id` VARCHAR(191) NOT NULL,
    `expire` INTEGER NULL DEFAULT 0,
    `keywordFinish` VARCHAR(100) NULL,
    `delayMessage` INTEGER NULL,
    `unknownMessage` VARCHAR(100) NULL,
    `listeningFromMe` BOOLEAN NULL DEFAULT false,
    `stopBotFromMe` BOOLEAN NULL DEFAULT false,
    `keepOpen` BOOLEAN NULL DEFAULT false,
    `debounceTime` INTEGER NULL,
    `ignoreJids` JSON NULL,
    `splitMessages` BOOLEAN NULL DEFAULT false,
    `timePerChar` INTEGER NULL DEFAULT 50,
    `speechToText` BOOLEAN NULL DEFAULT false,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `openaiCredsId` VARCHAR(191) NOT NULL,
    `openaiIdFallback` VARCHAR(100) NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `OpenaiSetting_openaiCredsId_key`(`openaiCredsId`),
    UNIQUE INDEX `OpenaiSetting_instanceId_key`(`instanceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Template` (
    `id` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `template` JSON NOT NULL,
    `webhookUrl` VARCHAR(500) NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Template_templateId_key`(`templateId`),
    UNIQUE INDEX `Template_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dify` (
    `id` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `description` VARCHAR(255) NULL,
    `botType` ENUM('chatBot', 'textGenerator', 'agent', 'workflow') NOT NULL,
    `apiUrl` VARCHAR(255) NULL,
    `apiKey` VARCHAR(255) NULL,
    `expire` INTEGER NULL DEFAULT 0,
    `keywordFinish` VARCHAR(100) NULL,
    `delayMessage` INTEGER NULL,
    `unknownMessage` VARCHAR(100) NULL,
    `listeningFromMe` BOOLEAN NULL DEFAULT false,
    `stopBotFromMe` BOOLEAN NULL DEFAULT false,
    `keepOpen` BOOLEAN NULL DEFAULT false,
    `debounceTime` INTEGER NULL,
    `ignoreJids` JSON NULL,
    `splitMessages` BOOLEAN NULL DEFAULT false,
    `timePerChar` INTEGER NULL DEFAULT 50,
    `triggerType` ENUM('all', 'keyword', 'none', 'advanced') NULL,
    `triggerOperator` ENUM('contains', 'equals', 'startsWith', 'endsWith', 'regex') NULL,
    `triggerValue` VARCHAR(191) NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DifySetting` (
    `id` VARCHAR(191) NOT NULL,
    `expire` INTEGER NULL DEFAULT 0,
    `keywordFinish` VARCHAR(100) NULL,
    `delayMessage` INTEGER NULL,
    `unknownMessage` VARCHAR(100) NULL,
    `listeningFromMe` BOOLEAN NULL DEFAULT false,
    `stopBotFromMe` BOOLEAN NULL DEFAULT false,
    `keepOpen` BOOLEAN NULL DEFAULT false,
    `debounceTime` INTEGER NULL,
    `ignoreJids` JSON NULL,
    `splitMessages` BOOLEAN NULL DEFAULT false,
    `timePerChar` INTEGER NULL DEFAULT 50,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `difyIdFallback` VARCHAR(100) NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `DifySetting_instanceId_key`(`instanceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EvolutionBot` (
    `id` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `description` VARCHAR(255) NULL,
    `apiUrl` VARCHAR(255) NULL,
    `apiKey` VARCHAR(255) NULL,
    `expire` INTEGER NULL DEFAULT 0,
    `keywordFinish` VARCHAR(100) NULL,
    `delayMessage` INTEGER NULL,
    `unknownMessage` VARCHAR(100) NULL,
    `listeningFromMe` BOOLEAN NULL DEFAULT false,
    `stopBotFromMe` BOOLEAN NULL DEFAULT false,
    `keepOpen` BOOLEAN NULL DEFAULT false,
    `debounceTime` INTEGER NULL,
    `ignoreJids` JSON NULL,
    `splitMessages` BOOLEAN NULL DEFAULT false,
    `timePerChar` INTEGER NULL DEFAULT 50,
    `triggerType` ENUM('all', 'keyword', 'none', 'advanced') NULL,
    `triggerOperator` ENUM('contains', 'equals', 'startsWith', 'endsWith', 'regex') NULL,
    `triggerValue` VARCHAR(191) NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EvolutionBotSetting` (
    `id` VARCHAR(191) NOT NULL,
    `expire` INTEGER NULL DEFAULT 0,
    `keywordFinish` VARCHAR(100) NULL,
    `delayMessage` INTEGER NULL,
    `unknownMessage` VARCHAR(100) NULL,
    `listeningFromMe` BOOLEAN NULL DEFAULT false,
    `stopBotFromMe` BOOLEAN NULL DEFAULT false,
    `keepOpen` BOOLEAN NULL DEFAULT false,
    `debounceTime` INTEGER NULL,
    `ignoreJids` JSON NULL,
    `splitMessages` BOOLEAN NULL DEFAULT false,
    `timePerChar` INTEGER NULL DEFAULT 50,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `botIdFallback` VARCHAR(100) NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `EvolutionBotSetting_instanceId_key`(`instanceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Flowise` (
    `id` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `description` VARCHAR(255) NULL,
    `apiUrl` VARCHAR(255) NULL,
    `apiKey` VARCHAR(255) NULL,
    `expire` INTEGER NULL DEFAULT 0,
    `keywordFinish` VARCHAR(100) NULL,
    `delayMessage` INTEGER NULL,
    `unknownMessage` VARCHAR(100) NULL,
    `listeningFromMe` BOOLEAN NULL DEFAULT false,
    `stopBotFromMe` BOOLEAN NULL DEFAULT false,
    `keepOpen` BOOLEAN NULL DEFAULT false,
    `debounceTime` INTEGER NULL,
    `ignoreJids` JSON NULL,
    `splitMessages` BOOLEAN NULL DEFAULT false,
    `timePerChar` INTEGER NULL DEFAULT 50,
    `triggerType` ENUM('all', 'keyword', 'none', 'advanced') NULL,
    `triggerOperator` ENUM('contains', 'equals', 'startsWith', 'endsWith', 'regex') NULL,
    `triggerValue` VARCHAR(191) NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FlowiseSetting` (
    `id` VARCHAR(191) NOT NULL,
    `expire` INTEGER NULL DEFAULT 0,
    `keywordFinish` VARCHAR(100) NULL,
    `delayMessage` INTEGER NULL,
    `unknownMessage` VARCHAR(100) NULL,
    `listeningFromMe` BOOLEAN NULL DEFAULT false,
    `stopBotFromMe` BOOLEAN NULL DEFAULT false,
    `keepOpen` BOOLEAN NULL DEFAULT false,
    `debounceTime` INTEGER NULL,
    `ignoreJids` JSON NULL,
    `splitMessages` BOOLEAN NULL DEFAULT false,
    `timePerChar` INTEGER NULL DEFAULT 50,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `flowiseIdFallback` VARCHAR(100) NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `FlowiseSetting_instanceId_key`(`instanceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IsOnWhatsapp` (
    `id` VARCHAR(191) NOT NULL,
    `remoteJid` VARCHAR(100) NOT NULL,
    `jidOptions` VARCHAR(191) NOT NULL,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,

    UNIQUE INDEX `IsOnWhatsapp_remoteJid_key`(`remoteJid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `N8n` (
    `id` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `description` VARCHAR(255) NULL,
    `webhookUrl` VARCHAR(255) NULL,
    `basicAuthUser` VARCHAR(255) NULL,
    `basicAuthPass` VARCHAR(255) NULL,
    `expire` INTEGER NULL DEFAULT 0,
    `keywordFinish` VARCHAR(100) NULL,
    `delayMessage` INTEGER NULL,
    `unknownMessage` VARCHAR(100) NULL,
    `listeningFromMe` BOOLEAN NULL DEFAULT false,
    `stopBotFromMe` BOOLEAN NULL DEFAULT false,
    `keepOpen` BOOLEAN NULL DEFAULT false,
    `debounceTime` INTEGER NULL,
    `ignoreJids` JSON NULL,
    `splitMessages` BOOLEAN NULL DEFAULT false,
    `timePerChar` INTEGER NULL DEFAULT 50,
    `triggerType` ENUM('all', 'keyword', 'none', 'advanced') NULL,
    `triggerOperator` ENUM('contains', 'equals', 'startsWith', 'endsWith', 'regex') NULL,
    `triggerValue` VARCHAR(191) NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `N8nSetting` (
    `id` VARCHAR(191) NOT NULL,
    `expire` INTEGER NULL DEFAULT 0,
    `keywordFinish` VARCHAR(100) NULL,
    `delayMessage` INTEGER NULL,
    `unknownMessage` VARCHAR(100) NULL,
    `listeningFromMe` BOOLEAN NULL DEFAULT false,
    `stopBotFromMe` BOOLEAN NULL DEFAULT false,
    `keepOpen` BOOLEAN NULL DEFAULT false,
    `debounceTime` INTEGER NULL,
    `ignoreJids` JSON NULL,
    `splitMessages` BOOLEAN NULL DEFAULT false,
    `timePerChar` INTEGER NULL DEFAULT 50,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `n8nIdFallback` VARCHAR(100) NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `N8nSetting_instanceId_key`(`instanceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Evoai` (
    `id` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `description` VARCHAR(255) NULL,
    `agentUrl` VARCHAR(255) NULL,
    `apiKey` VARCHAR(255) NULL,
    `expire` INTEGER NULL DEFAULT 0,
    `keywordFinish` VARCHAR(100) NULL,
    `delayMessage` INTEGER NULL,
    `unknownMessage` VARCHAR(100) NULL,
    `listeningFromMe` BOOLEAN NULL DEFAULT false,
    `stopBotFromMe` BOOLEAN NULL DEFAULT false,
    `keepOpen` BOOLEAN NULL DEFAULT false,
    `debounceTime` INTEGER NULL,
    `ignoreJids` JSON NULL,
    `splitMessages` BOOLEAN NULL DEFAULT false,
    `timePerChar` INTEGER NULL DEFAULT 50,
    `triggerType` ENUM('all', 'keyword', 'none', 'advanced') NULL,
    `triggerOperator` ENUM('contains', 'equals', 'startsWith', 'endsWith', 'regex') NULL,
    `triggerValue` VARCHAR(191) NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EvoaiSetting` (
    `id` VARCHAR(191) NOT NULL,
    `expire` INTEGER NULL DEFAULT 0,
    `keywordFinish` VARCHAR(100) NULL,
    `delayMessage` INTEGER NULL,
    `unknownMessage` VARCHAR(100) NULL,
    `listeningFromMe` BOOLEAN NULL DEFAULT false,
    `stopBotFromMe` BOOLEAN NULL DEFAULT false,
    `keepOpen` BOOLEAN NULL DEFAULT false,
    `debounceTime` INTEGER NULL,
    `ignoreJids` JSON NULL,
    `splitMessages` BOOLEAN NULL DEFAULT false,
    `timePerChar` INTEGER NULL DEFAULT 50,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL,
    `evoaiIdFallback` VARCHAR(100) NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `EvoaiSetting_instanceId_key`(`instanceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contact` ADD CONSTRAINT `Contact_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `IntegrationSession`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MessageUpdate` ADD CONSTRAINT `MessageUpdate_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `Message`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MessageUpdate` ADD CONSTRAINT `MessageUpdate_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Webhook` ADD CONSTRAINT `Webhook_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chatwoot` ADD CONSTRAINT `Chatwoot_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Label` ADD CONSTRAINT `Label_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Proxy` ADD CONSTRAINT `Proxy_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Setting` ADD CONSTRAINT `Setting_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rabbitmq` ADD CONSTRAINT `Rabbitmq_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Nats` ADD CONSTRAINT `Nats_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sqs` ADD CONSTRAINT `Sqs_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kafka` ADD CONSTRAINT `Kafka_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Websocket` ADD CONSTRAINT `Websocket_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pusher` ADD CONSTRAINT `Pusher_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Typebot` ADD CONSTRAINT `Typebot_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TypebotSetting` ADD CONSTRAINT `TypebotSetting_typebotIdFallback_fkey` FOREIGN KEY (`typebotIdFallback`) REFERENCES `Typebot`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TypebotSetting` ADD CONSTRAINT `TypebotSetting_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IntegrationSession` ADD CONSTRAINT `IntegrationSession_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Media` ADD CONSTRAINT `Media_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `Message`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Media` ADD CONSTRAINT `Media_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpenaiCreds` ADD CONSTRAINT `OpenaiCreds_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpenaiBot` ADD CONSTRAINT `OpenaiBot_openaiCredsId_fkey` FOREIGN KEY (`openaiCredsId`) REFERENCES `OpenaiCreds`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpenaiBot` ADD CONSTRAINT `OpenaiBot_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpenaiSetting` ADD CONSTRAINT `OpenaiSetting_openaiCredsId_fkey` FOREIGN KEY (`openaiCredsId`) REFERENCES `OpenaiCreds`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpenaiSetting` ADD CONSTRAINT `OpenaiSetting_openaiIdFallback_fkey` FOREIGN KEY (`openaiIdFallback`) REFERENCES `OpenaiBot`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpenaiSetting` ADD CONSTRAINT `OpenaiSetting_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Template` ADD CONSTRAINT `Template_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dify` ADD CONSTRAINT `Dify_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DifySetting` ADD CONSTRAINT `DifySetting_difyIdFallback_fkey` FOREIGN KEY (`difyIdFallback`) REFERENCES `Dify`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DifySetting` ADD CONSTRAINT `DifySetting_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvolutionBot` ADD CONSTRAINT `EvolutionBot_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvolutionBotSetting` ADD CONSTRAINT `EvolutionBotSetting_botIdFallback_fkey` FOREIGN KEY (`botIdFallback`) REFERENCES `EvolutionBot`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvolutionBotSetting` ADD CONSTRAINT `EvolutionBotSetting_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flowise` ADD CONSTRAINT `Flowise_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlowiseSetting` ADD CONSTRAINT `FlowiseSetting_flowiseIdFallback_fkey` FOREIGN KEY (`flowiseIdFallback`) REFERENCES `Flowise`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlowiseSetting` ADD CONSTRAINT `FlowiseSetting_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `N8n` ADD CONSTRAINT `N8n_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `N8nSetting` ADD CONSTRAINT `N8nSetting_n8nIdFallback_fkey` FOREIGN KEY (`n8nIdFallback`) REFERENCES `N8n`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `N8nSetting` ADD CONSTRAINT `N8nSetting_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evoai` ADD CONSTRAINT `Evoai_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvoaiSetting` ADD CONSTRAINT `EvoaiSetting_evoaiIdFallback_fkey` FOREIGN KEY (`evoaiIdFallback`) REFERENCES `Evoai`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvoaiSetting` ADD CONSTRAINT `EvoaiSetting_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

