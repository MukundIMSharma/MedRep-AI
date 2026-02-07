import mongoose from 'mongoose';
import { MedicalDocument } from '../models/medicalDocument.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const stats = await MedicalDocument.aggregate([
            {
                $group: {
                    _id: '$category',
                    uniqueCollections: { $addToSet: '$collectionName' },
                    docCount: { $sum: 1 }
                }
            }
        ]);
        console.log('--- DATABASE STATS ---');
        stats.forEach(s => {
            console.log(`Category: ${s._id}`);
            console.log(`  Documents: ${s.docCount}`);
            console.log(`  Unique Collections: ${s.uniqueCollections.length}`);
            console.log(`  Collections List: ${s.uniqueCollections.join(', ')}`);
            console.log('---------------------');
        });
        process.exit(0);
    } catch (e) {
        console.error('❌ Check failed:', e);
        process.exit(1);
    }
}
check();
