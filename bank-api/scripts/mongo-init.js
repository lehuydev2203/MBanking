// MongoDB initialization script
db = db.getSiblingDB('banking');

// Create collections with validation
db.createCollection('accounts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'passwordHash'],
      properties: {
        name: { bsonType: 'string' },
        email: { bsonType: 'string' },
        phone: { bsonType: 'string' },
        passwordHash: { bsonType: 'string' },
        role: {
          bsonType: 'string',
          enum: ['user', 'admin', 'superadmin'],
        },
        status: {
          bsonType: 'string',
          enum: ['active', 'locked'],
        },
        balance: { bsonType: 'decimal' },
        isEmailVerified: { bsonType: 'bool' },
      },
    },
  },
});

db.createCollection('email_verifications');
db.createCollection('transactions');
db.createCollection('audit_logs');

// Create indexes
db.accounts.createIndex({ email: 1 }, { unique: true });
db.accounts.createIndex({ phone: 1 }, { unique: true, sparse: true });
db.accounts.createIndex({ role: 1 });
db.accounts.createIndex({ status: 1 });

db.email_verifications.createIndex({ accountId: 1, createdAt: -1 });
db.email_verifications.createIndex({ code: 1 }, { unique: true });

db.transactions.createIndex({ accountId: 1, createdAt: -1 });
db.transactions.createIndex(
  { clientRequestId: 1 },
  { unique: true, sparse: true },
);

db.audit_logs.createIndex({ createdAt: -1 });

print('MongoDB initialization completed');
