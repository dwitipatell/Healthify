import { useState } from "react";

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I book an appointment?",
      answer: "You can easily book appointments from the dashboard by selecting an available time slot."
    },
    {
      question: "Can I reschedule my appointment?",
      answer: "Yes, appointments can be rescheduled anytime from your dashboard."
    },
    {
      question: "Will I get reminders?",
      answer: "Yes, the system supports reminders to help you stay on track."
    },
    {
      question: "Is my data secure?",
      answer: "We prioritize patient privacy and ensure secure handling of all data."
    },
    {
      question: "Why choose Healthify over other platforms?",
      answer: "Healthify stands out with AI-powered smart scheduling that suggests optimal time slots, automated reminders that reduce no-shows by up to 60%, comprehensive doctor dashboards for efficient queue management, and real-time hospital analytics. Unlike other platforms, we focus exclusively on healthcare scheduling with deep industry expertise and seamless integration capabilities."
    }
  ];

  return (
    <div id="faq" className="faq-container">
      <h2 className="faq-title">Frequently Asked Questions</h2>

      {faqs.map((faq, index) => (
        <div
          key={index}
          className={`faq-item ${openIndex === index ? "active" : ""}`}
          onClick={() =>
            setOpenIndex(openIndex === index ? null : index)
          }
        >
          <div className="faq-question">
            {faq.question}
            <span>{openIndex === index ? "−" : "+"}</span>
          </div>

          <div className="faq-answer">
            {faq.answer}
          </div>
        </div>
      ))}
    </div>
  );
}

export default FAQSection;