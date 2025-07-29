import React from 'react';
import MainLayout from '../layouts/MainLayout';

const About = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Our Company</h1>
          <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto">
            We're on a mission to revolutionize how businesses manage customer relationships through our innovative multi-tenant CRM platform.
          </p>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                At CRM Platform, we believe that businesses of all sizes deserve powerful, flexible customer relationship management tools that adapt to their unique needs. Our mission is to empower organizations to build stronger customer relationships through technology that works the way they do.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We're dedicated to creating a platform that allows businesses to manage multiple independent CRM instances from a single, unified interface, eliminating the complexity and overhead of maintaining separate systems while preserving the benefits of isolated environments.
              </p>
              <p className="text-lg text-gray-600">
                By focusing on flexibility, scalability, and user experience, we help businesses streamline their operations, improve customer satisfaction, and drive growth.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-100 rounded-full"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-100 rounded-full"></div>
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Team collaboration" 
                className="rounded-lg shadow-xl relative z-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do, from product development to customer support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Innovation',
                description: "We constantly push the boundaries of what's possible in CRM technology, seeking new solutions to complex business challenges.",
                icon: (
                  <svg className="h-10 w-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                ),
              },
              {
                title: 'Customer Focus',
                description: 'We put our customers at the center of everything we do, listening to their needs and continuously improving our platform based on their feedback.',
                icon: (
                  <svg className="h-10 w-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                ),
              },
              {
                title: 'Flexibility',
                description: 'We believe in building adaptable solutions that can be tailored to fit the unique needs of each business and evolve as those needs change.',
                icon: (
                  <svg className="h-10 w-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                  </svg>
                ),
              },
              {
                title: 'Transparency',
                description: 'We believe in open, honest communication with our customers, partners, and team members, building trust through transparency.',
                icon: (
                  <svg className="h-10 w-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                ),
              },
              {
                title: 'Security',
                description: "We prioritize the security and privacy of our customers' data, implementing robust protections and following industry best practices.",
                icon: (
                  <svg className="h-10 w-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                ),
              },
              {
                title: 'Continuous Improvement',
                description: "We're never satisfied with the status quo, constantly seeking ways to enhance our platform, processes, and customer experience.",
                icon: (
                  <svg className="h-10 w-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                ),
              },
            ].map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="p-3 bg-indigo-100 rounded-full inline-block mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Leadership Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our diverse team of experts is passionate about creating innovative CRM solutions that help businesses succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: 'Alex Johnson',
                title: 'CEO & Co-Founder',
                image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
                bio: 'With over 15 years of experience in enterprise software, Alex leads our company vision and strategy.',
              },
              {
                name: 'Samantha Lee',
                title: 'CTO & Co-Founder',
                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
                bio: 'Samantha drives our technical innovation, bringing her expertise in cloud architecture and multi-tenant systems.',
              },
              {
                name: 'David Rodriguez',
                title: 'Chief Product Officer',
                image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
                bio: 'David oversees our product roadmap, ensuring our platform meets the evolving needs of our customers.',
              },
              {
                name: 'Michelle Chen',
                title: 'Chief Customer Officer',
                image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
                bio: 'Michelle leads our customer success team, dedicated to helping businesses get the most from our platform.',
              },
            ].map((member, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 text-center">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-64 object-cover object-center"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-indigo-600 font-medium mb-3">{member.title}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our History */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From a small startup to an industry leader in multi-tenant CRM solutions.
            </p>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-0.5 bg-indigo-100 transform -translate-x-1/2"></div>

            <div className="space-y-12">
              {[
                {
                  year: '2015',
                  title: 'The Beginning',
                  description: 'CRM Platform was founded by Alex Johnson and Samantha Lee with a vision to revolutionize how businesses manage customer relationships.',
                },
                {
                  year: '2017',
                  title: 'First Major Release',
                  description: 'We launched the first version of our multi-tenant CRM platform, allowing businesses to create and manage multiple independent CRM instances.',
                },
                {
                  year: '2019',
                  title: 'Rapid Growth',
                  description: 'Our team expanded to 50 employees as we secured Series A funding and grew our customer base to over 500 businesses worldwide.',
                },
                {
                  year: '2021',
                  title: 'Enterprise Expansion',
                  description: 'We introduced enterprise-grade features and security enhancements, attracting larger organizations and expanding our market reach.',
                },
                {
                  year: '2023',
                  title: 'Global Presence',
                  description: 'With offices in North America, Europe, and Asia, we now serve thousands of businesses across diverse industries and continue to innovate.',
                },
              ].map((milestone, index) => (
                <div key={index} className="relative flex flex-col md:flex-row items-center">
                  <div className="flex-1 md:text-right md:pr-8 mb-4 md:mb-0">
                    {index % 2 === 0 ? (
                      <>
                        <h3 className="text-2xl font-bold text-indigo-600">{milestone.year}</h3>
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h4>
                        <p className="text-gray-600">{milestone.description}</p>
                      </>
                    ) : (
                      <div className="md:hidden">
                        <h3 className="text-2xl font-bold text-indigo-600">{milestone.year}</h3>
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h4>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="hidden md:flex items-center justify-center z-10">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center">
                      <span className="font-bold">{milestone.year.slice(-2)}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 md:pl-8">
                    {index % 2 === 1 ? (
                      <div className="hidden md:block">
                        <h3 className="text-2xl font-bold text-indigo-600">{milestone.year}</h3>
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h4>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    ) : (
                      <div className="md:hidden">
                        <h3 className="text-2xl font-bold text-indigo-600">{milestone.year}</h3>
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h4>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Join Our Team */}
      <section className="py-16 md:py-24 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Our Growing Team
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            We're always looking for talented individuals who are passionate about creating innovative solutions and making a difference.
          </p>
          <a 
            href="/careers" 
            className="inline-block px-8 py-4 bg-white text-indigo-700 font-medium rounded-md shadow-md hover:bg-indigo-50 transition-colors duration-300"
          >
            View Open Positions
          </a>
        </div>
      </section>
    </MainLayout>
  );
};

export default About; 