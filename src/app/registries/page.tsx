'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import Input  from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { PlusIcon, Gift, Trash2, ExternalLink, Edit } from 'lucide-react'
import { useSession } from '@/context/SessionContext'
interface Registry {
  id: number
  name: string
  userId?: number
  eventId: number
}

interface Gift {
  id: number
  giftName: string
  price: number
  giftUrl: string
  registryId: number
  giftStatus: boolean
}

interface Event {
  id: number
  eventName: string
}

export default function GiftRegistry() {
  const [registries, setRegistries] = useState<Registry[]>([])
  const [selectedRegistry, setSelectedRegistry] = useState<Registry | null>(null)
  const [gifts, setGifts] = useState<Gift[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isCreateRegistryOpen, setIsCreateRegistryOpen] = useState(false)
  const [isUpdateRegistryOpen, setIsUpdateRegistryOpen] = useState(false)
  const [isAddGiftOpen, setIsAddGiftOpen] = useState(false)
  const [newRegistry, setNewRegistry] = useState({ name: '', eventId: '' })
  const [newGift, setNewGift] = useState({ giftName: '', giftUrl: '', price: '' })
  const [updatedRegistry, setUpdatedRegistry] = useState({ name: '', eventId: '' })

  const session = useSession();

  const userId = session?.user?.id

  useEffect(() => {
    fetchRegistries()
    fetchEvents()
  }, [])

  const fetchRegistries = async () => {
    try {
      const response = await fetch(`http://localhost:4000/v1/registries/user-registries/${userId}`)
      if (!response.ok) throw new Error('Failed to fetch registries')
      const data = await response.json()
      setRegistries(data)
    } catch (error) {
      console.error('Error fetching registries:', error)
      toast.error('Failed to fetch registries')
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch(`http://localhost:4000/v1/events/user/${userId}`)
      if (!response.ok) throw new Error('Failed to fetch events')
      const data = await response.json()
      setEvents(data.data)
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to fetch events')
    }
  }

  const fetchGifts = async (registryId: number) => {
    try {
      const response = await fetch(`http://localhost:4000/v1/gifts/gift-list/${registryId}`)
      if (!response.ok) throw new Error('Failed to fetch gifts')
      const data = await response.json()
      setGifts(data)
    } catch (error) {
      console.error('Error fetching gifts:', error)
      toast.error('Failed to fetch gifts')
    }
  }

  const handleCreateRegistry = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:4000/v1/registries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRegistry.name,
          userId,
          eventId: parseInt(newRegistry.eventId)
        }),
      })
      if (!response.ok) throw new Error('Failed to create registry')
      const data = await response.json()
      setRegistries([...registries, data])
      setIsCreateRegistryOpen(false)
      setNewRegistry({ name: '', eventId: '' })
      toast.success('Registry created successfully')
    } catch (error) {
      console.error('Error creating registry:', error)
      toast.error('Failed to create registry')
    }
  }

  const handleAddGift = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRegistry) return
    try {
      const response = await fetch('http://localhost:4000/v1/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftName: newGift.giftName,
          giftUrl: newGift.giftUrl,
          price: parseFloat(newGift.price),
          registryId: selectedRegistry.id,
        }),
      })
      if (!response.ok) throw new Error('Failed to add gift')
      const data = await response.json()
      setGifts([...gifts, data])
      setIsAddGiftOpen(false)
      setNewGift({ giftName: '', giftUrl: '', price: '' })
      toast.success('Gift added successfully')
    } catch (error) {
      console.error('Error adding gift:', error)
      toast.error('Failed to add gift')
    }
  }

  const handleDeleteGift = async (giftId: number) => {
    try {
      const response = await fetch(`http://localhost:4000/v1/gifts/${giftId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete gift')
      setGifts(gifts.filter(gift => gift.id !== giftId))
      toast.success('Gift deleted successfully')
    } catch (error) {
      console.error('Error deleting gift:', error)
      toast.error('Failed to delete gift')
    }
  }




  const handleUpdateRegistry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRegistry) return
    try {
      const response = await fetch(`http://localhost:4000/v1/registries/${selectedRegistry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedRegistry.name,
          eventId: parseInt(updatedRegistry.eventId)
        }),
      })
      if (!response.ok) throw new Error('Failed to update registry')
      const data = await response.json()
      setRegistries(registries.map(reg => (reg.id === selectedRegistry.id ? data : reg)))
      setIsUpdateRegistryOpen(false)
      toast.success('Registry updated successfully')
    } catch (error) {
      console.error('Error updating registry:', error)
      toast.error('Failed to update registry')
    }
  }
  
  const handleDeleteRegistry = async (registryId: number) => {
    try {
      const response = await fetch(`http://localhost:4000/v1/registries/${registryId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete registry');
      setRegistries(registries.filter(reg => reg.id !== registryId));
      toast.success('Registry deleted successfully');
    } catch (error) {
      console.error('Error deleting registry:', error);
      toast.error('Failed to delete registry');
    }
  };
  





// return (
//   <div className="container mx-auto p-4">
//     <h1 className="text-3xl font-bold mb-6">Gift Registry</h1>
//     <div className="flex justify-between mb-6">
//       <Dialog open={isCreateRegistryOpen} onOpenChange={setIsCreateRegistryOpen}>
//         <DialogTrigger asChild>
//           <Button>
//             <PlusIcon className="mr-2 h-4 w-4" /> Create Registry
//           </Button>
//         </DialogTrigger>
//         <DialogContent className="bg-black text-white"> {/* Updated for black and white theme */}
//           <DialogHeader>
//             <DialogTitle>Create New Registry</DialogTitle>
//           </DialogHeader>
//           <form onSubmit={handleCreateRegistry} className="space-y-4">
//             <Input
//               className="bg-gray-800 text-white border-gray-600" // Input styling
//               placeholder="Registry Name"
//               value={newRegistry.name}
//               onChange={(e) => setNewRegistry({ ...newRegistry, name: e.target.value })}
//               required
//             />
//             <Select
//               value={newRegistry.eventId}
//               onValueChange={(value) => setNewRegistry({ ...newRegistry, eventId: value })}
//             >
//               <SelectTrigger className="bg-gray-800 text-white"> {/* Styling SelectTrigger */}
//                 <SelectValue placeholder="Select Event" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectGroup>
//                   {events.map((event) => (
//                     <SelectItem key={event.id} value={event.id.toString()}>
//                       {event.eventName}
//                     </SelectItem>
//                   ))}
//                 </SelectGroup>
//               </SelectContent>
//             </Select>
//             <Button className="bg-white text-black hover:bg-gray-200">Create Registry</Button> {/* Button styling */}
//           </form>
//         </DialogContent>
//       </Dialog>
//     </div>

//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//       {registries.map((registry) => (
//         <Card key={registry.id} className="cursor-pointer hover:shadow-lg transition-shadow bg-gray-50">
//           <CardHeader>
//             <CardTitle>{registry.name}</CardTitle>
//             <CardDescription>
//               Event: {events.find(e => e.id === registry.eventId)?.eventName}
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Button
//               onClick={() => {
//                 setSelectedRegistry(registry);
//                 fetchGifts(registry.id);
//               }}
//               className="w-full"
//             >
//               View Gifts
//             </Button>
//           </CardContent>
//           <CardFooter className="flex justify-between">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => handleUpdateRegistry(registry.id)}
//             >
//               <Edit className="mr-2 h-4 w-4" /> Update
//             </Button>
//             <Button
//               variant="destructive"
//               size="sm"
//               onClick={() => handleDeleteRegistry(registry.id)}
//             >
//               <Trash2 className="mr-2 h-4 w-4" /> Delete
//             </Button>
//           </CardFooter>
//         </Card>
//       ))}
//     </div>

//     {selectedRegistry && (
//       <div className="mt-8">
//         <h2 className="text-2xl font-bold mb-4">Gifts for {selectedRegistry.name}</h2>
//         <Dialog open={isAddGiftOpen} onOpenChange={setIsAddGiftOpen}>
//           <DialogTrigger asChild>
//             <Button className="mb-4">
//               <PlusIcon className="mr-2 h-4 w-4" /> Add Gift
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="bg-black text-white"> {/* Updated for black and white theme */}
//             <DialogHeader>
//               <DialogTitle>Add New Gift</DialogTitle>
//             </DialogHeader>
//             <form onSubmit={handleAddGift} className="space-y-4">
//               <Input
//                 className="bg-gray-800 text-white border-gray-600" // Input styling
//                 placeholder="Gift Name"
//                 value={newGift.giftName}
//                 onChange={(e) => setNewGift({ ...newGift, giftName: e.target.value })}
//                 required
//               />
//               <Input
//                 className="bg-gray-800 text-white border-gray-600" // Input styling
//                 placeholder="Gift URL"
//                 value={newGift.giftUrl}
//                 onChange={(e) => setNewGift({ ...newGift, giftUrl: e.target.value })}
//                 required
//               />
//               <Input
//                 className="bg-gray-800 text-white border-gray-600" // Input styling
//                 type="number"
//                 placeholder="Price"
//                 value={newGift.price}
//                 onChange={(e) => setNewGift({ ...newGift, price: e.target.value })}
//                 required
//               />
//               <Button className="bg-white text-black hover:bg-gray-200">Add Gift</Button> {/* Button styling */}
//             </form>
//           </DialogContent>
//         </Dialog>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {gifts.map((gift) => (
//             <Card key={gift.id}>
//               <CardHeader>
//                 <CardTitle className="flex items-center">
//                   <Gift className="mr-2 h-5 w-5" /> {gift.giftName}
//                 </CardTitle>
//                 <CardDescription>${gift.price.toFixed(2)}</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <a
//                   href={gift.giftUrl}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-500 hover:underline flex items-center"
//                 >
//                   View Gift <ExternalLink className="ml-1 h-4 w-4" />
//                 </a>
//               </CardContent>
//               <CardFooter className="flex justify-between">
//                 <Button variant="outline" size="sm">
//                   <Edit className="mr-2 h-4 w-4" /> Edit
//                 </Button>
//                 <Button
//                   variant="destructive"
//                   size="sm"
//                   onClick={() => handleDeleteGift(gift.id)}
//                 >
//                   <Trash2 className="mr-2 h-4 w-4" /> Delete
//                 </Button>
//               </CardFooter>
//             </Card>
//           ))}
//         </div>
//       </div>
//     )}



//     <ToastContainer />
//   </div>
// );


return (
  <div className="container mx-auto p-4">
    <h1 className="text-3xl font-bold mb-6">Gift Registry</h1>
    <div className="flex justify-between mb-6">
      <Dialog open={isCreateRegistryOpen} onOpenChange={setIsCreateRegistryOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" /> Create Registry
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-black text-white">
          <DialogHeader>
            <DialogTitle>Create New Registry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateRegistry} className="space-y-4">
            <Input
              className="bg-gray-800 text-white border-gray-600"
              placeholder="Registry Name"
              value={newRegistry.name}
              onChange={(e) => setNewRegistry({ ...newRegistry, name: e.target.value })}
              required
            />
            <Select
              value={newRegistry.eventId}
              onValueChange={(value) => setNewRegistry({ ...newRegistry, eventId: value })}
            >
              <SelectTrigger className="bg-gray-800 text-white">
                <SelectValue placeholder="Select Event" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.eventName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button type="submit" className="bg-white text-black hover:bg-gray-200">Create Registry</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {registries.map((registry) => (
        <Card key={registry.id} className="cursor-pointer hover:shadow-lg transition-shadow bg-gray-50">
          <CardHeader>
            <CardTitle>{registry.name}</CardTitle>
            <CardDescription>
              Event: {events.find(e => e.id === registry.eventId)?.eventName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                setSelectedRegistry(registry);
                fetchGifts(registry.id);
              }}
              className="w-full"
            >
              View Gifts
            </Button>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Dialog open={isUpdateRegistryOpen} onOpenChange={setIsUpdateRegistryOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRegistry(registry);
                    setUpdatedRegistry({ name: registry.name, eventId: registry.eventId.toString() });
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" /> Update
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black text-white">
                <DialogHeader>
                  <DialogTitle>Update Registry</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateRegistry} className="space-y-4">
                  <Input
                    className="bg-gray-800 text-white border-gray-600"
                    placeholder="Registry Name"
                    value={updatedRegistry.name}
                    onChange={(e) => setUpdatedRegistry({ ...updatedRegistry, name: e.target.value })}
                    required
                  />
                  <Select
                    value={updatedRegistry.eventId}
                    onValueChange={(value) => setUpdatedRegistry({ ...updatedRegistry, eventId: value })}
                  >
                    <SelectTrigger className="bg-gray-800 text-white">
                      <SelectValue placeholder="Select Event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id.toString()}>
                            {event.eventName}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button type="submit" className="bg-white text-black hover:bg-gray-200">Update Registry</Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteRegistry(registry.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>

    {selectedRegistry && (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Gifts for {selectedRegistry.name}</h2>
        <Dialog open={isAddGiftOpen} onOpenChange={setIsAddGiftOpen}>
          <DialogTrigger asChild>
            <Button className="mb-4">
              <PlusIcon className="mr-2 h-4 w-4" /> Add Gift
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black text-white">
            <DialogHeader>
              <DialogTitle>Add New Gift</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddGift} className="space-y-4">
              <Input
                className="bg-gray-800 text-white border-gray-600"
                placeholder="Gift Name"
                value={newGift.giftName}
                onChange={(e) => setNewGift({ ...newGift, giftName: e.target.value })}
                required
              />
              <Input
                className="bg-gray-800 text-white border-gray-600"
                placeholder="Gift URL"
                value={newGift.giftUrl}
                onChange={(e) => setNewGift({ ...newGift, giftUrl: e.target.value })}
                required
              />
              <Input
                className="bg-gray-800 text-white border-gray-600"
                type="number"
                placeholder="Price"
                value={newGift.price}
                onChange={(e) => setNewGift({ ...newGift, price: e.target.value })}
                required
              />
              <Button type="submit" className="bg-white text-black hover:bg-gray-200">Add Gift</Button>
            </form>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gifts.map((gift) => (
            <Card key={gift.id}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="mr-2 h-5 w-5" /> {gift.giftName}
                </CardTitle>
                <CardDescription>${gift.price.toFixed(2)}</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href={gift.giftUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline flex items-center"
                >
                  View Gift <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteGift(gift.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )}

    <ToastContainer />
  </div>
)

}