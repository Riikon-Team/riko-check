import React, { createContext, useContext, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { eventsAPI } from '../utils/apiUtils'

const EventContext = createContext()

export function useEvent() {
  return useContext(EventContext)
}

export function EventProvider({ children }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchEvents = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const data = await eventsAPI.getAll(params)
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const createEvent = async (eventData) => {
    try {
      const newEvent = await eventsAPI.create(eventData)
      setEvents(prev => [...prev, newEvent])
      toast.success('Tạo sự kiện thành công!')
      return newEvent
    } catch (error) {
      console.error('Error creating event:', error)
      return null
    }
  }

  const updateEvent = async (id, eventData) => {
    try {
      const updatedEvent = await eventsAPI.update(id, eventData)
      setEvents(prev => prev.map(event => 
        event.id === id ? updatedEvent : event
      ))
      toast.success('Cập nhật sự kiện thành công!')
      return updatedEvent
    } catch (error) {
      console.error('Error updating event:', error)
      return null
    }
  }

  const deleteEvent = async (id) => {
    try {
      await eventsAPI.delete(id)
      setEvents(prev => prev.filter(event => event.id !== id))
      toast.success('Xóa sự kiện thành công!')
      return true
    } catch (error) {
      console.error('Error deleting event:', error)
      return false
    }
  }

  const getEventById = async (id) => {
    try {
      return await eventsAPI.getById(id)
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
