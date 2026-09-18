"use client";

import Image from "next/image";
import Link from "next/link";

const showcaseImage = "/AIRCON HOME.webp";

export function AirconsShowcase() {
  return (
    <main className="nivis-page">
      <style>{`
        .nivis-page {
          min-height: 100%;
          width: 100%;
          box-sizing: border-box;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          color: #ffffff;
          font-family: var(--font-google-sans-flex), Arial, Helvetica, sans-serif;
        }
        .nivis-showcase {
          width: 100%;
          max-width: 1436px;
          min-height: 572px;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: 35fr 40fr 25fr;
          gap: 12px;
          padding: 6px 12px;
          border-radius: 8px;
          background: #0d0b14;
          overflow: hidden;
        }
        .nivis-copy,
        .nivis-details {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .nivis-copy {
          justify-content: space-between;
        }
        .nivis-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 13px 0 14px;
          border-top: 1px solid rgba(124, 124, 124, .4);
          color: #e7e7e7;
          font-size: 14px;
          line-height: 14px;
          letter-spacing: .08em;
        }
        .nivis-mark {
          width: 14px;
          height: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #7c7c7c;
          flex: 0 0 auto;
        }
        .nivis-mark svg,
        .nivis-arrow svg { display: block; }
        .nivis-photo {
          min-width: 0;
          height: 560px;
          margin: 0;
          position: relative;
        }
        .nivis-photo img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 4px;
          background: #27252d;
        }
        .nivis-details {
          justify-content: flex-start;
          padding-top: 260px;
        }
        .nivis-details h2 {
          margin: 0 0 22px;
          padding-top: 30px;
          border-top: 1px solid rgba(124, 124, 124, .4);
          font-family: var(--font-google-sans-flex), Arial, Helvetica, sans-serif;
          font-size: clamp(30px, 2.5vw, 36px);
          line-height: .95;
          letter-spacing: .02em;
          font-weight: 500;
          overflow-wrap: break-word;
        }
        .nivis-description {
          padding-bottom: 38px;
          color: #bdbec0;
          font-size: 14px;
          line-height: 1.3;
          letter-spacing: -.01em;
        }
        .nivis-description p { margin: 0; }
        .nivis-button {
          width: 100%;
          min-height: 52px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 8px 16px;
          border-radius: 0;
          background: #1C99D6;
          color: #ffffff;
          font-size: 14px;
          line-height: 1;
          letter-spacing: .06em;
          text-decoration: none;
          transition: background-color .25s ease, transform .25s ease;
        }
        .nivis-button:hover,
        .nivis-button:focus-visible { background: #1680b0; transform: scale(1.02); }
        .nivis-button:focus-visible { outline: 2px solid #ffffff; outline-offset: 3px; }
        .nivis-arrow { display: inline-flex; width: 16px; height: 16px; align-self: flex-start; }
        @media (max-width: 1000px) {
          .nivis-page { padding: 12px; }
          .nivis-showcase {
            grid-template-columns: 35fr 40fr 25fr;
            min-height: 520px;
          }
          .nivis-photo { height: 508px; }
          .nivis-details { padding-top: 220px; }
          .nivis-description { padding-bottom: 24px; }
        }
        @media (max-width: 760px) {
          .nivis-page { padding: 0; align-items: stretch; }
          .nivis-showcase {
            min-height: 100vh;
            grid-template-columns: 1fr;
            gap: 22px;
            padding: 18px 16px 20px;
            border-radius: 0;
          }
          .nivis-copy { order: 1; min-height: 0; }
          .nivis-photo { order: 2; height: min(92vw, 470px); }
          .nivis-details { order: 3; padding-top: 0; padding-bottom: 8px; }
          .nivis-details h2 { font-size: clamp(30px, 8vw, 34px); }
          .nivis-button { max-width: none; }
        }
      `}</style>
      <section className="nivis-showcase" aria-label="Aircons Store showcase">
        <section className="nivis-copy">
          <div className="nivis-brand" aria-label="Aircons Store">
            <span className="nivis-mark" aria-hidden="true">
              <svg width="17" height="15" viewBox="0 0 17 15" fill="none">
                <path d="M1 7.8s1.52 1.43 2.41 2.27V2C7.23 5.88 15 14 15 14h-3.66L5.95 8.38V14H3.37L1 11.52V7.8Z" stroke="currentColor" />
              </svg>
            </span>
            <span>AIRCONS STORE</span>
          </div>
        </section>

        <figure className="nivis-photo">
          <Image
            src={showcaseImage}
            alt="Premium wall-mounted air conditioner in a modern South African home"
            fill
            className="object-cover"
            quality={100}
            sizes="(max-width: 760px) 92vw, (max-width: 1000px) 50vw, 1000px"
          />
        </figure>

        <section className="nivis-details" aria-labelledby="science-heading">
          <div>
            <h2 id="science-heading">It starts with comfort.</h2>
            <div className="nivis-description">
              <p>
                Applying that comfort to every home. From inverter efficiency to precise cooling power for any room — we know because we&apos;re aircon specialists.
              </p>
            </div>
            <Link className="nivis-button" href="/products" aria-label="Shop all air conditioners">
              <span>SHOP ALL AIRCONS</span>
              <span className="nivis-arrow" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="m5 11 6-6m0 0v6m0-6H5" stroke="currentColor" />
                </svg>
              </span>
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
