import Image from 'next/image'
import { TeamMember } from '@/types'

export default function TeamPage() {
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Dion',
      role: 'Founder & CEO',
      bio: 'Visionary leader with 15+ years of industry experience.',
      image: '/team/john.svg',
      email: 'dion@catalyxlabs.co.nz',
    },
    {
      id: '2',
      name: 'Robert',
      role: 'CTO',
      bio: 'Technology expert passionate about innovation.',
      image: '/team/jane.svg',
      email: 'robert@catalyxlabs.co.nz',
    },
    {
      id: '3',
      name: 'Daena',
      role: 'Product Manager',
      bio: 'Customer-focused product strategist.',
      image: '/team/mike.svg',
      email: 'daena@catalyxlabs.co.nz',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Our Team</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {teamMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
            <div className="relative h-56 bg-gray-50">
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
              <p className="text-catalyx-purple font-semibold mb-4">{member.role}</p>
              <p className="text-gray-600 mb-4">{member.bio}</p>
              {member.email && (
                <a href={`mailto:${member.email}`} className="text-catalyx-purple hover:underline">
                  {member.email}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
