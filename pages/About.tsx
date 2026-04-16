import React, { useEffect, useState } from "react";
import { COLORS } from "../constants";
import {
  getPageContent,
  getLeaders,
  subscribeStoreUpdates,
} from "../services/mockData";
/* LOCAL IMAGES */
import headerBg from "../assets/images/about-header.jpg";
import formationImg from "../assets/images/formation.jpg";
/* Flashback Images */
import y2016 from "../assets/images/flashback/2016.jpeg";
import y2017 from "../assets/images/flashback/2017.jpg";
import y2018 from "../assets/images/flashback/2018.jpg";
import y2019 from "../assets/images/flashback/2019.jpg";
import y2020 from "../assets/images/flashback/2020.jpeg";
import y2021 from "../assets/images/flashback/2021.jpg";
import y2022 from "../assets/images/flashback/2022.jpg";
import y2023 from "../assets/images/flashback/2023.jpg";
import y2024 from "../assets/images/flashback/2024.jpeg";
import y2025 from "../assets/images/flashback/2025.jpg";

import leader1 from "../assets/images/leaders/leader1.jpg";
import leader2 from "../assets/images/leaders/leader2.jpg";
import leader3 from "../assets/images/leaders/leader3.jpg";
import leader4 from "../assets/images/leaders/leader4.jpeg";
import leader5 from "../assets/images/leaders/leader5.jpg";

const flashbacks = [
  {
    year: 2016,
    title: "Foundation Conversations",
    text: "Initial discussions among Butaleja professionals on collective community responsibility.",
    image: y2016,
  },
  {
    year: 2017,
    title: "Community Trust Building",
    text: "Early engagement with local leaders and families to understand real needs.",
    image: y2017,
  },
  {
    year: 2018,
    title: "First Organised Activities",
    text: "Small-scale education and welfare support initiatives launched.",
    image: y2018,
  },
  {
    year: 2019,
    title: "Formal Structure",
    text: "Defined leadership, objectives, and accountability mechanisms.",
    image: y2019,
  },
  {
    year: 2020,
    title: "Resilience During Crisis",
    text: "Sustained support to vulnerable families during challenging times.",
    image: y2020,
  },
  {
    year: 2021,
    title: "Program Expansion",
    text: "Education and welfare programs scaled across multiple communities.",
    image: y2021,
  },
  {
    year: 2022,
    title: "Partnership Growth",
    text: "Collaborations with donors and local stakeholders strengthened impact.",
    image: y2022,
  },
  {
    year: 2023,
    title: "Operational Maturity",
    text: "Improved reporting, governance, and program monitoring.",
    image: y2023,
  },
  {
    year: 2024,
    title: "Community Reach",
    text: "Support extended to more households and schools in Butaleja.",
    image: y2024,
  },
  {
    year: 2025,
    title: "Sustained Impact",
    text: "Serving communities with a stable volunteer base and long-term vision.",
    image: y2025,
  },
];

const fallbackLeaders = [
  {
    name: "Higenyi W. John",
    role: "President",
    experience: "Community development & policy advocacy",
    image: leader1,
  },
  {
    name: "Masebba A. Nasser",
    role: "Chief of Operations",
    experience: "NGO program design and monitoring expert",
    image: leader2,
  },
  {
    name: "Nesihwe Betty",
    role: "Vice President",
    experience: "Community Leadership & education specialist",
    image: leader3,
  },
  {
    name: "Mulabi David",
    role: "Finance & Compliance",
    experience:
      "Program management, International Development and Public Policy Consultant",
    image: leader4,
  },
  {
    name: "Dr. Nampandu Henry",
    role: "Ligle Adviser",
    experience: "International Administrative Law Practitioner",
    image: leader5,
  },
];

const About: React.FC = () => {
  const [content, setContent] = useState(getPageContent());
  useEffect(
    () => subscribeStoreUpdates(() => setContent(getPageContent())),
    [],
  );
  const timeline = flashbacks.map((item) => ({
    ...item,
    image:
      item.year === 2016
        ? content.aboutFlashback2016 || item.image
        : item.year === 2017
          ? content.aboutFlashback2017 || item.image
          : item.year === 2018
            ? content.aboutFlashback2018 || item.image
            : item.year === 2019
              ? content.aboutFlashback2019 || item.image
              : item.year === 2020
                ? content.aboutFlashback2020 || item.image
                : item.year === 2021
                  ? content.aboutFlashback2021 || item.image
                  : item.year === 2022
                    ? content.aboutFlashback2022 || item.image
                    : item.year === 2023
                      ? content.aboutFlashback2023 || item.image
                      : item.year === 2024
                        ? content.aboutFlashback2024 || item.image
                        : content.aboutFlashback2025 || item.image,
  }));
  return (
    <div className="bg-white">
      {/* ================= HEADER ================= */}
      <section
        className="py-28 text-center text-white relative"
        style={{
          backgroundImage: `linear-gradient(rgba(90,0,0,0.85), rgba(90,0,0,0.85)), url(${content.aboutHeaderImage || headerBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-black mb-4">
            {content.aboutHeaderTitle || "About Naanghirisa"}
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto font-medium">
            {content.aboutHeaderSubtitle ||
              content.aboutVision ||
              "Building a community with equal opportunities."}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-20">
        {/* ================= STORY & FORMATION ================= */}
        <div className="grid md:grid-cols-2 gap-16 mb-24 items-center">
          <div>
            <span className="font-bold text-sm tracking-widest uppercase mb-4 block text-orange-600">
              The Journey
            </span>
            <h2 className="text-4xl font-black mb-6 text-red-900">
              {content.aboutMission || "What is Naanghirisa"}
            </h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              {content.aboutStory ||
                "Naanghirisa was founded to respond to the gaps facing vulnerable children and households in the community."}
            </p>
            <p className="text-slate-600 leading-relaxed">
              {content.aboutJoinText ||
                "Naanghirisa is a community-based organisation that works to support vulnerable households, improve education access, and strengthen local livelihoods."}
            </p>

            {/* Mission & Vision */}
            <div className="grid sm:grid-cols-2 gap-6 mt-10">
              <div className="p-6 rounded-2xl bg-slate-50 border items-center">
                <i className="fas fa-bullseye text-2xl text-orange-600 mb-4"></i>
                <h4 className="font-black mb-2">Our Mission</h4>
                <p className="text-sm text-slate-600">
                  {content.aboutMission ||
                    "To empower vulnerable children and communities through education, health, and sustainable initiatives."}
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border">
                <i className="fas fa-eye text-2xl text-orange-600 mb-4"></i>
                <h4 className="font-black mb-2">Our Vision</h4>
                <p className="text-sm text-slate-600">
                  {content.aboutVision ||
                    "A resilient, educated, and self-sustaining Butaleja community."}
                </p>
              </div>
            </div>
          </div>

          <img
            src={content.aboutFormationImage || formationImg}
            alt="Formation"
            className="rounded-2xl shadow-xl border-4 border-white"
          />
        </div>

        {/* Principles & Membership */}
        <div className="grid md:grid-cols-2 gap-12 mb-24">
          <div
            className="p-10 rounded-[2.5rem] text-white"
            style={{ backgroundColor: COLORS.primary }}
          >
            <h3 className="text-2xl font-black mb-6">Core Principles</h3>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="mt-1" style={{ color: COLORS.secondary }}>
                  <i className="fas fa-check-circle"></i>
                </div>
                <div>
                  <h4 className="font-bold">Transparency First</h4>
                  <p className="text-sm opacity-80 text-red-100">
                    Every donation and expenditure is tracked and reported to
                    our donors.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1" style={{ color: COLORS.secondary }}>
                  <i className="fas fa-check-circle"></i>
                </div>
                <div>
                  <h4 className="font-bold">Community Empowerment</h4>
                  <p className="text-sm opacity-80 text-red-100">
                    We work with local leaders to identify the children most in
                    need.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1" style={{ color: COLORS.secondary }}>
                  <i className="fas fa-check-circle"></i>
                </div>
                <div>
                  <h4 className="font-bold">Compassionate Care</h4>
                  <p className="text-sm opacity-80 text-red-100">
                    Education is not just fees; it is emotional and physical
                    welfare.
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100">
            <h3
              className="text-2xl font-black mb-6"
              style={{ color: COLORS.primary }}
            >
              Who Can Join Us?
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Naanghirisa is an open community. We believe in collective action
              and welcome anyone who shares our vision of a brighter future for
              the girl child and vulnerable youth.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <i
                  className="fas fa-user-friends"
                  style={{ color: COLORS.secondary }}
                ></i>
                <span>Volunteers of all backgrounds</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <i
                  className="fas fa-hand-holding-heart"
                  style={{ color: COLORS.secondary }}
                ></i>
                <span>Individual and Corporate Donors</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <i
                  className="fas fa-network-wired"
                  style={{ color: COLORS.secondary }}
                ></i>
                <span>Community Partners & Organisations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mb-10 text-justify">
          <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100">
            <h3
              className="text-2xl font-black mb-6"
              style={{ color: COLORS.primary }}
            >
              {content.aboutPublicDomainTitle || "Butaleja in public domain"}
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              {content.aboutPublicDomainText ||
                "Butaleja district faces severe challenges in education and child welfare. Naanghirisa responds through practical, accountable action."}
            </p>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Butaleja district has the unenviable distinction of having the
              youngest grandmother ever recorded in Uganda aged 27 years. As the
              same time, school drop-out has increased to 70% in upper primary.
              These negative indicators are mainly affecting the girls due to
              factors such as early marriage, where, again, Butaleja is among
              the most affected districts. Not surprisingly, the district is
              also struggling with poor academic outcomes, for example in the
              2015 primary leaving exams only 59 (1.4%) students scored Grade
              ‘A’ out of 4,196 students, while 20.6% failed. A UNEB (2015) study
              found Butaleja among the worst performing districts in educational
              outcomes: in upper primary only 10.9% of students were literate in
              English while only 27.5% were numerate. In response to this
              situation, Naanghirisa chose education as one of its priority
              areas of focus and developed the PASS project (Promoting Academic
              Success in Schools). The goal of this project is to contribute to
              the improvement of education standards in Butaleja in general.
              However, due to the gender-based disadvantages girls face in
              education, we have special emphasis to support girls to progress
              in education under the Girl-Child Education Initiative of the PASS
              Project. In line with this Initiative, we initiated the ‘Prof.
              Margaret Mungherera Scholarship for Girl-Child Education
              Excellence’. The main objectives of this scholarship is to
              ‘…support the education of bright but disadvantaged girls from
              Butaleja who are, otherwise, unable to progress with studies at
              two levels: (1) to progress at secondary level; (2) to study
              medicine or a medical related course at university’.
            </p>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Poverty, Early marriage, Teenage Oregncaies, Gender Based
              Violence, HIV and AIDS, and low participation in post-primary
              education are some of the situations attributed to Butaleja
              District. Adolescent girls, in particular, face multiple
              vulnerabilities. Many girls also drop out of school as a result of
              unwanted teenage pregnancies and ealry marrages. According to the
              Ministry of Health, 25% of Ugandan teenagers become pregnant by
              the age of 19. Close to half are married before their 18th
              birthdays and continue having babies into their mid-40s. Many
              teenage mothers do not have access to adquate reproductive health
              care and die while trying to give life. A survey conducted by
              Butaleja District Health Office in all health centeres revealed
              that at least 5,265 girls between 10 and 19 years were
              impregnanted and have dropped out of school in Butaleja District
              from 2019 to 2020. Of the 5,265 impregnanted girls, only 3,596
              attended antenatal care.
            </p>
          </div>
        </div>
        {/* ================= FLASHBACK SECTION ================= */}
        <section className="py-4 w-full bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-red-900 mb-2">
                Our Journey
              </h2>
              <p className="text-slate-500 text-lg">
                From our foundation in 2016 to today
              </p>
            </div>
            <div className="relative pl-12 space-y-6">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-[3px] bg-orange-200"></div>
              {timeline.map((item, index) => (
                <div key={index} className="relative">
                  {/* Timeline dot — perfectly centered on the line */}
                  <div
                    className="absolute left-[22px] top-1/2 -translate-y-1/2
                          w-4 h-4 rounded-full bg-orange-500 border-4 border-white z-10"
                  />

                  {/* Card */}
                  <div className="group ml-12 bg-white rounded-2xl border border-slate-100 shadow-lg p-4 overflow-hidden transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-2xl hover:border-orange-200">
                    <div className="grid md:grid-cols-[18%_82%] gap-4 items-center">
                      {/* Image */}
                      <div className="w-full">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-20 md:h-26 object-cover rounded-xl shadow-md border transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      </div>

                      {/* Content */}
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className="px-3 py-1 text-xs font-black uppercase rounded-full
                                   bg-orange-500 text-white tracking-widest"
                          >
                            {item.year}
                          </span>
                          <h4 className="font-black text-lg text-red-900">
                            {item.title}
                          </h4>
                        </div>

                        <p className="text-slate-600 text-sm leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ================= LEADERSHIP ================= */}
      <div id="leadership">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-red-900">
            Leadership & Governance
          </h2>
          <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
            Experienced leadership committed to integrity and impact.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 max-w-7xl mx-auto px-4 mb-20">
          {(getLeaders().length
            ? getLeaders()
            : fallbackLeaders.map(
                (l) => ({ ...l, profile: l.experience }) as any,
              )
          ).map((leader, i) => (
            <div
              key={i}
              className="group bg-white text-center p-5 rounded-3xl overflow-hidden border border-slate-100 shadow-lg transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl hover:border-orange-200"
            >
              <div className="relative mb-5 mx-auto w-28 h-28">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-100 to-slate-100 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <img
                  src={leader.image}
                  alt={leader.name}
                  className="relative z-10 w-28 h-28 mx-auto rounded-full object-cover shadow-lg border-4 border-white transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <h4 className="font-black text-slate-900">{leader.name}</h4>
              <p className="text-orange-600 text-[10px] font-black uppercase tracking-[0.25em] mt-1">
                {leader.role}
              </p>
              <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                {leader.profile}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
