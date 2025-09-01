import React, { createContext, useContext, useState, useCallback } from 'react'
import toast from 'react-hot-toast'

const EventContext = createContext()

export function useEvent() {
  return useContext(EventContext)
}

export function EventProvider({ children }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Không thể tải danh sách sự kiện')
    } finally {
      setLoading(false)
    }
  }, [])

  const createEvent = async (eventData) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        const newEvent = await response.json()
        setEvents(prev => [...prev, newEvent])
        toast.success('Tạo sự kiện thành công!')
        return newEvent
      } else {
        const error = await response.json()
        toast.error(error.message || 'Tạo sự kiện thất bại!')
        return null
      }
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Tạo sự kiện thất bại!')
      return null
    }
  }

  const updateEvent = async (id, eventData) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        const updatedEvent = await response.json()
        setEvents(prev => prev.map(event => 
          event.id === id ? updatedEvent : event
        ))
        toast.success('Cập nhật sự kiện thành công!')
        return updatedEvent
      } else {
        const error = await response.json()
        toast.error(error.message || 'Cập nhật sự kiện thất bại!')
        return null
      }
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error('Cập nhật sự kiện thất bại!')
      return null
    }
  }

  const deleteEvent = async (id) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setEvents(prev => prev.filter(event => event.id !== id))
        toast.success('Xóa sự kiện thành công!')
        return true
      } else {
        const error = await response.json()
        toast.error(error.message || 'Xóa sự kiện thất bại!')
        return false
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Xóa sự kiện thất bại!')
      return false
    }
  }

  const getEventById = async (id) => {
    try {
      const response = await fetch(`/api/events/${id}`)
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Error fetching event:', error)
      return null
    }
  }

  const value = {
    events,
    loading,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById
  }

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  )
}
