/**
 * DataPermission Model
 * Manages user consent for Serenity AI data analysis
 */

import mongoose from 'mongoose';

const dataPermissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },

    // Granular permission flags
    permissions: {
        analyzeJournals: {
            type: Boolean,
            default: false
        },
        analyzeVoiceNotes: {
            type: Boolean,
            default: false
        },
        analyzeConversations: {
            type: Boolean,
            default: false
        },
        analyzeSleepData: {
            type: Boolean,
            default: false
        },
        analyzeAssessments: {
            type: Boolean,
            default: false
        },
        analyzeMood: {
            type: Boolean,
            default: false
        }
    },

    // When permissions were last granted/modified
    grantedAt: {
        type: Date,
        default: null
    },

    // Last time Serenity requested additional permissions
    lastRequestedAt: {
        type: Date,
        default: null
    },

    // User can revoke all permissions at once
    revokedAll: {
        type: Boolean,
        default: false
    },

    // Consent history for audit trail (important for GDPR compliance)
    consentHistory: [{
        action: {
            type: String,
            enum: ['grant', 'revoke', 'modify'],
            required: true
        },
        dataType: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        ipAddress: String,
        userAgent: String
    }]

}, {
    timestamps: true
});

// Method to grant permission for a specific data type
dataPermissionSchema.methods.grantPermission = function (dataType, meta = {}) {
    if (this.permissions.hasOwnProperty(dataType)) {
        this.permissions[dataType] = true;
        this.grantedAt = new Date();
        this.revokedAll = false;
        this.consentHistory.push({
            action: 'grant',
            dataType,
            timestamp: new Date(),
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent
        });
        return true;
    }
    return false;
};

// Method to revoke permission for a specific data type
dataPermissionSchema.methods.revokePermission = function (dataType, meta = {}) {
    if (this.permissions.hasOwnProperty(dataType)) {
        this.permissions[dataType] = false;
        this.consentHistory.push({
            action: 'revoke',
            dataType,
            timestamp: new Date(),
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent
        });
        return true;
    }
    return false;
};

// Method to grant all permissions at once
dataPermissionSchema.methods.grantAll = function (meta = {}) {
    Object.keys(this.permissions).forEach(key => {
        this.permissions[key] = true;
    });
    this.grantedAt = new Date();
    this.revokedAll = false;
    this.consentHistory.push({
        action: 'grant',
        dataType: 'all',
        timestamp: new Date(),
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent
    });
    return true;
};

// Method to revoke all permissions at once
dataPermissionSchema.methods.revokeAll = function (meta = {}) {
    Object.keys(this.permissions).forEach(key => {
        this.permissions[key] = false;
    });
    this.revokedAll = true;
    this.consentHistory.push({
        action: 'revoke',
        dataType: 'all',
        timestamp: new Date(),
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent
    });
    return true;
};

// Static method to get or create permissions for a user
dataPermissionSchema.statics.getOrCreate = async function (userId) {
    let permission = await this.findOne({ userId });
    if (!permission) {
        permission = new this({ userId });
        await permission.save();
    }
    return permission;
};

// Check if any permission is granted
dataPermissionSchema.methods.hasAnyPermission = function () {
    return Object.values(this.permissions).some(p => p === true);
};

export default mongoose.model('DataPermission', dataPermissionSchema);
