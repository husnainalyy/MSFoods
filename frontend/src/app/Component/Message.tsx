import Image from "next/image";

const Message = () => {
  return (
    <div className="px-6 py-10">
      <div className="flex flex-col md:flex-row items-center justify-between max-w-5xl mx-auto">
        {/* Message Section */}
        <div className="w-full md:w-[70%] text-center md:text-left">
          <p className="text-2xl text-gray-800 leading-relaxed font-medium">
            MS Foods started with a simple vision—to bring <b>pure, high-quality spices, dry fruits, and natural food products</b> to your kitchen, just like I would for my own family. Growing up, I always believed that the best flavors come from <b>fresh, authentic ingredients</b>, and that’s exactly what we promise to deliver.
          </p>
        </div>

        {/* Image Section - Desktop */}
        <div className="hidden md:flex w-full md:w-[30%] flex-col items-center mt-8 md:mt-0">
          <div className="w-48 h-48 rounded-full overflow-hidden shadow-lg">
            <Image
              src="/face.avif"
              alt="Owner"
              width={192}
              height={192}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Mobile Layout: Signature & Image side by side */}
      <div className="flex md:hidden justify-center items-center gap-4 mt-6">
        {/* Signature */}
        <Image src="/signature.png" alt="Signature" width={120} height={50} />

        {/* Owner's Image */}
        <div className="w-28 h-28 rounded-full overflow-hidden shadow-lg">
          <Image
            src="/face.avif"
            alt="Owner"
            width={112}
            height={112}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Signature - Desktop (below image) */}
      <div className="hidden md:flex justify-center mt-6">
        <Image src="/signature.png" alt="Signature" width={200} height={80} />
      </div>
    </div>
  );
};

export default Message;
