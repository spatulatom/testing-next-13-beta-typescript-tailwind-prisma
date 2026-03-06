const imgBackground = '/6eb1ace30466c8c549c10b959988c3a75c125cea.png';
const imgService1Jpg = '/fc86261c9e08235f045053e0aa319962de6613f9.png';
const imgService2Jpg = '/526c4e27bea3bc084047fa2a726283cd51cbcae9.png';
const imgService3Jpg = '/b4d96d34d2fd91642f685a4469dd4625a1c5a870.png';
const imgAvatarOnHomePng = '/62db3be97152f6a8ad3e2d56a52cba0db9b35d43.png';
const imgLeafJpg = '/717a0bbc0bf97aefadababaa65bd40a8f70be4fa.png';
const imgBackground1 = '/892b8d2c17451900080608dff23b6f39bd697c2b.png';
const imgQuotesSvg = '/quotes.svg';

const services = [
  {
    title: 'Web Design',
    image: imgService1Jpg,
    description:
      "Focus on how you can help and benefit your user. Use simple words so that you don't confuse people.",
  },
  {
    title: 'Graphic Design',
    image: imgService2Jpg,
    description:
      "Focus on how you can help and benefit your user. Use simple words so that you don't confuse people.",
  },
  {
    title: 'Content Creation',
    image: imgService3Jpg,
    description:
      "Focus on how you can help and benefit your user. Use simple words so that you don't confuse people.",
  },
];

const primaryButtonClassName =
  'rounded-nature-button bg-nature-highlight px-8 py-3 font-nature text-sm text-nature-primary transition-opacity hover:opacity-90';

const secondaryButtonClassName =
  'rounded-nature-button border border-nature-primary px-6 py-3 font-nature text-sm text-nature-primary transition-colors hover:bg-nature-primary hover:text-app-inverse';

const sectionClassName = 'px-6 py-20 lg:px-12';
const sectionHeadingClassName =
  'font-nature-display text-4xl tracking-tight text-nature-primary md:text-5xl';

export default function LoveNaturePage() {
  return (
    <div className="bg-app-inverse w-full pt-20">
      <section
        aria-labelledby="love-nature-hero-title"
        className="min-h-nature-hero relative flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <img
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            src={imgBackground}
          />
        </div>
        <div className="bg-nature-overlay absolute inset-0" />

        <div className="relative z-10 flex max-w-3xl flex-col items-center gap-4 px-6 text-center">
          <p className="font-nature text-app-inverse text-5xl font-normal tracking-tighter md:text-6xl">
            we all love
          </p>
          <h1
            id="love-nature-hero-title"
            className="font-nature text-app-inverse text-8xl leading-none font-normal tracking-tighter md:text-9xl"
          >
            nature
          </h1>
          <p className="font-nature text-app-inverse max-w-64 text-base leading-6">
            Look deep into nature, and you will
            <br />
            understand everything better.
          </p>
          <button className={primaryButtonClassName} type="button">
            Get Started
          </button>
        </div>
      </section>

      <section
        aria-labelledby="love-nature-services-title"
        className={sectionClassName}
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2
              id="love-nature-services-title"
              className={sectionHeadingClassName}
            >
              Our Services
            </h2>
            <div className="bg-nature-highlight h-0.5 w-16" />
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.title}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-6 w-full overflow-hidden rounded-sm">
                  <img
                    alt={service.title}
                    className="h-full w-full object-cover"
                    src={service.image}
                  />
                </div>
                <h3 className="font-nature text-nature-primary mb-4 text-xl">
                  {service.title}
                </h3>
                <p className="font-nature text-nature-copy text-base leading-7">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="love-nature-testimonial-title"
        className="bg-nature-surface px-6 py-20 lg:px-12"
      >
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-12 opacity-30">
            <img
              alt=""
              aria-hidden="true"
              className="mx-auto h-8 w-9"
              src={imgQuotesSvg}
            />
          </div>

          <h2 id="love-nature-testimonial-title" className="sr-only">
            Testimonial
          </h2>
          <p className="font-nature-display text-nature-primary mb-8 text-4xl tracking-tight italic md:text-5xl">
            "Original and with an innate understanding of their customer's
            needs, the team at Love Nature are always a pleasure to work with."
          </p>

          <div className="size-nature-avatar mx-auto mb-4 overflow-hidden rounded-full">
            <img
              alt="Jane Miller"
              className="h-full w-full object-cover"
              src={imgAvatarOnHomePng}
            />
          </div>

          <p className="font-nature text-nature-copy text-sm">Jane Miller</p>
        </div>
      </section>

      <section
        aria-labelledby="love-nature-about-title"
        className={sectionClassName}
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-nature text-nature-copy-muted mb-4 text-xs tracking-widest uppercase">
              About Us
            </p>
            <h2
              id="love-nature-about-title"
              className={sectionHeadingClassName}
            >
              Tell website visitors who you are and why they should choose your
              business.
            </h2>
            <p className="font-nature text-nature-copy mt-8 mb-8 text-base leading-7">
              Because when a visitor first lands on your website, you&apos;re a
              stranger to them. They have to get to know you in order to want to
              read your blog posts, subscribe to your email newsletter, or buy
              what you&apos;re selling.
            </p>
            <button className={secondaryButtonClassName} type="button">
              Find Out More
            </button>
          </div>

          <div className="overflow-hidden rounded-sm">
            <img
              alt="Leaf on a branch"
              className="h-auto w-full"
              src={imgLeafJpg}
            />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="love-nature-cta-title"
        className="min-h-nature-cta relative flex items-center justify-center overflow-hidden px-6 py-20"
      >
        <div className="absolute inset-0">
          <img
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            src={imgBackground1}
          />
        </div>

        <div className="relative z-10 max-w-2xl text-center">
          <h2
            id="love-nature-cta-title"
            className="font-nature text-nature-primary text-5xl tracking-tight sm:text-6xl"
          >
            QUESTIONS?
          </h2>
          <p className="font-nature text-nature-primary-soft mt-6 mb-8 text-lg leading-8">
            Whether you&apos;re curious about features, a free trial, or even
            press, we&apos;re here to answer any questions.
          </p>
          <button className={primaryButtonClassName} type="button">
            Let&apos;s Talk Now
          </button>
        </div>
      </section>
    </div>
  );
}
