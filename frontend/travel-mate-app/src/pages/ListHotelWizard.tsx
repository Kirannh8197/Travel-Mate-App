import { motion } from 'framer-motion';
import { AddHotelForm } from '../components/forms/hotel/AddHotelForm'; 

export const ListHotelWizard = () => {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50 relative overflow-hidden flex items-center justify-center">
            
            {/* Ambient aesthetic blur elements */}
            <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-[var(--tm-liquid-blue)]/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-[var(--tm-ethereal-purple)]/20 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="w-full z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    {/* Render the extracted, clean form */}
                    <AddHotelForm />
                </motion.div>
            </div>
            
        </div>
    );
};