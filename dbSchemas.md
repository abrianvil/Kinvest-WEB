generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum GroupStatus {
  DRAFT
  ACTIVE
  PAUSED
  COMPLETED
  ARCHIVED
}

enum GroupMemberRole {
  OWNER
  ADMIN
  MEMBER
}

enum GroupMemberStatus {
  INVITED
  ACTIVE
  LEFT
  REMOVED
}

enum CycleStatus {
  PENDING
  IN_PROGRESS
  PAID_OUT
  CANCELLED
  OVERDUE
}

enum CycleParticipantStatus {
  PENDING
  ON_TIME
  LATE
  PAID
  WAIVED
}

enum ContributionStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  REFUNDED
}

enum PayoutStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
}

enum WalletOwnerType {
  USER
  GROUP
  PLATFORM
}

enum WalletStatus {
  ACTIVE
  SUSPENDED
  CLOSED
}

enum TransactionType {
  CONTRIBUTION
  PAYOUT
  FEE
  REFUND
  ADJUSTMENT
}

enum TransactionDirection {
  CREDIT
  DEBIT
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  REVERSED
}

enum PaymentProvider {
  STRIPE
  PLAID
  PAYPAL
  MANUAL
}

enum PaymentIntentStatus {
  REQUIRES_ACTION
  PENDING
  SUCCEEDED
  FAILED
  CANCELLED
}

enum KycStatus {
  UNVERIFIED
  PENDING
  VERIFIED
  REJECTED
}

enum RotationStrategy {
  FIXED_ORDER
  BIDDING
  RANDOM
  NEED_BASED
}

enum Frequency {
  WEEKLY
  BIWEEKLY
  MONTHLY
  CUSTOM
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  DECLINED
  EXPIRED
}

enum AuditActorType {
  USER
  SYSTEM
  ADMIN
}

enum AuditAction {
  CREATE_GROUP
  JOIN_GROUP
  LEAVE_GROUP
  START_CYCLE
  COMPLETE_CYCLE
  RECORD_CONTRIBUTION
  RECORD_PAYOUT
  UPDATE_RULES
  INVITE_MEMBER
}

model User {
  id          String   @id
  email       String?  @unique
  phone       String?  @unique
  displayName String?
  avatarUrl   String?
  locale      String?  @default("en")
  isBlocked   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  identities          IdentityProvider[]
  kycProfiles         KycProfile[]
  memberships         GroupMember[]
  groupsOwned         Group[]              @relation("GroupOwner")
  groupTemplates      GroupTemplate[]      @relation("GroupTemplateCreator")
  cyclesReceiving     Cycle[]              @relation("CycleReceiver")
  cycleParticipations CycleParticipant[]   @relation("CycleParticipantUser")
  paymentIntents      PaymentIntent[]
  contributions       Contribution[]
  payouts             Payout[]
  auditLogs           AuditLog[]
  invitations         Invitation[]         @relation("InvitationInvitee")
  invitesSent         Invitation[]         @relation("InvitationInviter")
}

model IdentityProvider {
  id              String   @id @default(cuid())
  userId          String
  provider        String
  providerUserId  String
  createdAt       DateTime @default(now())
  lastLoginAt     DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerUserId])
}

model KycProfile {
  id          String   @id @default(cuid())
  userId      String
  status      KycStatus @default(UNVERIFIED)
  referenceId String?
  notes       String?
  reviewedBy  String?
  reviewedAt  DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model GroupTemplate {
  id                 String           @id @default(cuid())
  name               String
  description        String?
  contributionAmount Decimal          @db.Decimal(12, 2)
  currency           String           @default("USD")
  frequency          Frequency
  slotCount          Int
  rotationStrategy   RotationStrategy
  lateFeePercent     Decimal?         @db.Decimal(5, 2)
  gracePeriodDays    Int?             @default(0)
  rules              Json?
  createdById        String
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt

  createdBy User  @relation("GroupTemplateCreator", fields: [createdById], references: [id])
  groups    Group[]
}

model Group {
  id                 String           @id @default(cuid())
  templateId         String?
  ownerId            String
  name               String
  description        String?
  contributionAmount Decimal          @db.Decimal(12, 2)
  currency           String           @default("USD")
  frequency          Frequency
  slotCount          Int
  rotationStrategy   RotationStrategy
  lateFeePercent     Decimal?         @db.Decimal(5, 2)
  gracePeriodDays    Int?             @default(0)
  status             GroupStatus      @default(ACTIVE)
  currentCycleNumber Int              @default(0)
  memberCount        Int              @default(0)
  totalVolume        Decimal          @default(0) @db.Decimal(14, 2)
  metadata           Json?
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt

  template GroupTemplate? @relation(fields: [templateId], references: [id])
  owner    User           @relation("GroupOwner", fields: [ownerId], references: [id])
  members  GroupMember[]
  cycles   Cycle[]
  invites  Invitation[]   @relation("GroupInvites")
}

model GroupMember {
  id        String            @id @default(cuid())
  groupId   String
  userId    String
  role      GroupMemberRole   @default(MEMBER)
  status    GroupMemberStatus @default(INVITED)
  joinedAt  DateTime?
  leftAt    DateTime?
  createdAt DateTime          @default(now())

  group Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([groupId, userId])
  @@index([userId])
}

model Cycle {
  id              String      @id @default(cuid())
  groupId         String
  cycleNumber     Int
  scheduledDate   DateTime
  status          CycleStatus @default(PENDING)
  receiverUserId  String?
  totalExpected   Decimal     @default(0) @db.Decimal(14, 2)
  totalReceived   Decimal     @default(0) @db.Decimal(14, 2)
  completedAt     DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  group    Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  receiver User? @relation("CycleReceiver", fields: [receiverUserId], references: [id])
  participants CycleParticipant[]
  contributions Contribution[]
  payouts        Payout[]

  @@unique([groupId, cycleNumber])
}

model CycleParticipant {
  id             String                 @id @default(cuid())
  cycleId        String
  userId         String
  amountExpected Decimal                @db.Decimal(12, 2)
  amountPaid     Decimal                @default(0) @db.Decimal(12, 2)
  paidAt         DateTime?
  status         CycleParticipantStatus @default(PENDING)
  createdAt      DateTime               @default(now())
  updatedAt      DateTime               @updatedAt

  cycle Cycle @relation(fields: [cycleId], references: [id], onDelete: Cascade)
  user  User  @relation("CycleParticipantUser", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([cycleId, userId])
  @@index([userId])
}

model Wallet {
  id               String          @id @default(cuid())
  ownerType        WalletOwnerType
  ownerId          String
  currency         String          @default("USD")
  availableBalance Decimal         @default(0) @db.Decimal(14, 2)
  pendingBalance   Decimal         @default(0) @db.Decimal(14, 2)
  status           WalletStatus    @default(ACTIVE)
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt

  transactions  Transaction[]
  paymentIntents PaymentIntent[]

  @@unique([ownerType, ownerId, currency])
  @@index([ownerId])
}

model Transaction {
  id               String             @id @default(cuid())
  walletId         String
  type             TransactionType
  direction        TransactionDirection
  amount           Decimal            @db.Decimal(14, 2)
  currency         String
  status           TransactionStatus  @default(PENDING)
  relatedType      String?
  relatedId        String?
  metadata         Json?
  createdAt        DateTime           @default(now())
  completedAt      DateTime?

  wallet        Wallet        @relation(fields: [walletId], references: [id], onDelete: Cascade)
  paymentIntent PaymentIntent? @relation("TransactionPaymentIntent")
  contribution  Contribution?  @relation("TransactionContribution")
  payout        Payout?        @relation("TransactionPayout")

  @@index([walletId])
  @@index([relatedType, relatedId])
}

model PaymentIntent {
  id                String              @id @default(cuid())
  userId            String
  walletId          String
  amount            Decimal             @db.Decimal(14, 2)
  currency          String
  provider          PaymentProvider
  providerPaymentId String?
  status            PaymentIntentStatus @default(PENDING)
  errorCode         String?
  metadata          Json?
  transactionId     String? @unique
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  wallet      Wallet      @relation(fields: [walletId], references: [id], onDelete: Cascade)
  transaction Transaction? @relation("TransactionPaymentIntent", fields: [transactionId], references: [id])
  contributions Contribution[]
}

model Contribution {
  id             String             @id @default(cuid())
  cycleId        String
  userId         String
  amount         Decimal            @db.Decimal(12, 2)
  status         ContributionStatus @default(PENDING)
  paymentIntentId String?
  transactionId  String? @unique
  notes          String?
  createdAt      DateTime           @default(now())
  updatedAt      DateTime           @updatedAt

  cycle        Cycle        @relation(fields: [cycleId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  paymentIntent PaymentIntent? @relation(fields: [paymentIntentId], references: [id])
  transaction   Transaction?   @relation("TransactionContribution", fields: [transactionId], references: [id])

  @@index([userId])
  @@index([cycleId])
}

model Payout {
  id             String        @id @default(cuid())
  cycleId        String
  userId         String
  amount         Decimal       @db.Decimal(12, 2)
  status         PayoutStatus  @default(PENDING)
  transactionId  String? @unique
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  cycle      Cycle       @relation(fields: [cycleId], references: [id], onDelete: Cascade)
  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  transaction Transaction? @relation("TransactionPayout", fields: [transactionId], references: [id])
}

model Invitation {
  id             String           @id @default(cuid())
  groupId        String?
  inviterUserId  String
  inviteeUserId  String?
  inviteeContact String
  status         InvitationStatus @default(PENDING)
  metadata       Json?
  createdAt      DateTime         @default(now())
  respondedAt    DateTime?

  group   Group? @relation("GroupInvites", fields: [groupId], references: [id], onDelete: Cascade)
  inviter User   @relation("InvitationInviter", fields: [inviterUserId], references: [id])
  invitee User?  @relation("InvitationInvitee", fields: [inviteeUserId], references: [id])

  @@index([inviteeContact])
}

model AuditLog {
  id         String        @id @default(cuid())
  actorType  AuditActorType
  actorId    String?
  action     AuditAction
  entityType String
  entityId   String
  metadata   Json?
  createdAt  DateTime      @default(now())

  user User? @relation(fields: [actorId], references: [id])

  @@index([actorId])
  @@index([entityType, entityId])
}
