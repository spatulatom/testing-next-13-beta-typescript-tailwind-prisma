const imgBackground = "/6eb1ace30466c8c549c10b959988c3a75c125cea.png";
const imgService1Jpg = "/fc86261c9e08235f045053e0aa319962de6613f9.png";
const imgService2Jpg = "/526c4e27bea3bc084047fa2a726283cd51cbcae9.png";
const imgService3Jpg = "/b4d96d34d2fd91642f685a4469dd4625a1c5a870.png";
const imgAvatarOnHomePng = "/62db3be97152f6a8ad3e2d56a52cba0db9b35d43.png";
const imgLeafJpg = "/717a0bbc0bf97aefadababaa65bd40a8f70be4fa.png";
const imgBackground1 = "/892b8d2c17451900080608dff23b6f39bd697c2b.png";
const imgQuotesSvg = "/quotes.svg";

export default function LoveNaturePage() {
  return (
    <div className="bg-white relative w-full" data-name="1440w default" data-node-id="5:2">
      <div className="w-full" data-name="Main → Article" data-node-id="5:3" style={{ paddingTop: '80px' }}>
        {/* Hero Section */}
        <div className="h-[655px] w-full relative overflow-hidden" data-name="Background" data-node-id="5:4">
          <div className="absolute inset-0">
            <img alt="background" className="w-full h-full object-cover" src={imgBackground} />
          </div>
          <div className="absolute inset-0 bg-black opacity-30" data-node-id="5:5" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <h1 className="text-[50px] font-['DM_Sans'] font-normal text-white leading-[70px] tracking-[-3px] mb-4" data-node-id="5:6">
              we all love
            </h1>
            <h2 className="text-[117px] font-['DM_Sans'] font-normal text-white leading-[163.8px] tracking-[-3px] mb-4" data-node-id="5:7">
              nature
            </h2>
            <p className="text-[16px] font-['DM_Sans'] text-white text-center leading-[24px] max-w-[256px] mb-8" data-node-id="5:8">
              Look deep into nature, and you will<br />understand everything better.
            </p>
            <button className="bg-[#ffd936] text-[#536942] font-['DM_Sans'] text-[14px] px-8 py-3 rounded-[4px] hover:opacity-90 transition" data-node-id="5:9">
              Get Started
            </button>
          </div>
        </div>

        {/* Our Services Section */}
        <div className="w-full px-12 py-20">
          <h2 className="text-center text-[40px] font-['Forum'] text-[#536942] tracking-[-2px] mb-8" data-node-id="5:11">
            Our Services
          </h2>
          
          <div className="flex justify-center mb-12">
            <div className="border-t-2 border-[#ffd936] w-16"></div>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto mb-8">
            {/* Service 1 */}
            <div className="flex flex-col items-center" data-node-id="5:13">
              <div className="w-full aspect-[343/464] rounded-[2px] overflow-hidden mb-6">
                <img alt="Web Design" className="w-full h-full object-cover" src={imgService1Jpg} />
              </div>
              <h3 className="text-[20px] font-['DM_Sans'] text-[#536942] text-center mb-4" data-node-id="5:14">
                Web Design
              </h3>
              <p className="text-[16px] font-['DM_Sans'] text-[rgba(83,105,65,0.89)] text-center" data-node-id="5:15">
                Focus on how you can help and benefit your user. Use simple words so that you don't confuse people.
              </p>
            </div>

            {/* Service 2 */}
            <div className="flex flex-col items-center" data-node-id="5:16">
              <div className="w-full aspect-[343/464] rounded-[2px] overflow-hidden mb-6">
                <img alt="Graphic Design" className="w-full h-full object-cover" src={imgService2Jpg} />
              </div>
              <h3 className="text-[20px] font-['DM_Sans'] text-[#536942] text-center mb-4" data-node-id="5:17">
                Graphic Design
              </h3>
              <p className="text-[16px] font-['DM_Sans'] text-[rgba(83,105,65,0.89)] text-center" data-node-id="5:18">
                Focus on how you can help and benefit your user. Use simple words so that you don't confuse people.
              </p>
            </div>

            {/* Service 3 */}
            <div className="flex flex-col items-center" data-node-id="5:19">
              <div className="w-full aspect-[343/464] rounded-[2px] overflow-hidden mb-6">
                <img alt="Content Creation" className="w-full h-full object-cover" src={imgService3Jpg} />
              </div>
              <h3 className="text-[20px] font-['DM_Sans'] text-[#536942] text-center mb-4" data-node-id="5:20">
                Content Creation
              </h3>
              <p className="text-[16px] font-['DM_Sans'] text-[rgba(83,105,65,0.89)] text-center" data-node-id="5:21">
                Focus on how you can help and benefit your user. Use simple words so that you don't confuse people.
              </p>
            </div>
          </div>
        </div>

        {/* Testimonial Section */}
        <div className="w-full bg-[#f6f8f5] py-20 px-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-12 opacity-30">
              <img alt="quotes" className="w-[37px] h-[30.56px] mx-auto" src={imgQuotesSvg} />
            </div>
            
            <p className="text-[35px] font-['Forum'] text-[#536942] leading-[43px] tracking-[-2px] mb-8 italic" data-node-id="5:28">
              "Original and with an innate understanding of their customer's needs, the team at Love Nature are always a pleasure to work with."
            </p>

            <div className="w-[50px] h-[50px] mx-auto rounded-full overflow-hidden mb-4">
              <img alt="Jane Miller" className="w-full h-full object-cover" src={imgAvatarOnHomePng} />
            </div>

            <p className="text-[14px] font-['DM_Sans'] text-[rgba(83,105,65,0.89)]" data-node-id="5:30">
              Jane Miller
            </p>
          </div>
        </div>

        {/* About Section */}
        <div className="w-full px-12 py-20">
          <div className="max-w-6xl mx-auto grid grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[12px] font-['DM_Sans'] text-[rgba(83,105,65,0.7)] tracking-wide mb-4 uppercase" data-node-id="5:32">
                About Us
              </p>
              <h2 className="text-[40px] font-['Forum'] text-[#536942] leading-[44px] tracking-[-2px] mb-8" data-node-id="5:33">
                Tell website visitors who you are and why they should choose your business.
              </h2>
              <p className="text-[16px] font-['DM_Sans'] text-[rgba(83,105,65,0.89)] leading-[27.2px] mb-8" data-node-id="5:34">
                Because when a visitor first lands on your website, you're a stranger to them. They have to get to know you in order to want to read your blog posts, subscribe to your email newsletter, or buy what you're selling.
              </p>
              <button className="border border-[#536942] text-[#536942] font-['DM_Sans'] text-[15px] px-6 py-3 rounded-[4px] hover:bg-[#536942] hover:text-white transition" data-node-id="5:35">
                Find Out More
              </button>
            </div>

            <div className="rounded-[2px] overflow-hidden">
              <img alt="leaf" className="w-full h-auto object-cover" src={imgLeafJpg} />
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="h-[480px] w-full relative overflow-hidden flex flex-col items-center justify-center" data-name="Background" data-node-id="5:38">
          <div className="absolute inset-0">
            <img alt="background" className="w-full h-full object-cover" src={imgBackground1} />
          </div>
          
          <div className="relative z-10 text-center">
            <h2 className="text-[58px] font-['DM_Sans'] text-[#536942] tracking-[-2px] mb-6" data-node-id="5:39">
              QUESTIONS?
            </h2>
            <p className="text-[17px] font-['DM_Sans'] text-[#526840] leading-[32px] max-w-[414px] mb-8" data-node-id="5:40">
              Whether you're curious about features, a free trial, or even press, we're here to answer any questions.
            </p>
            <button className="bg-[#ffd936] text-[#536942] font-['DM_Sans'] text-[14px] px-8 py-3 rounded-[4px] hover:opacity-90 transition" data-node-id="5:41">
              Let's Talk Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
